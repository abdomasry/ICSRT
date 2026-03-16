const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const whatsappService = require('./whatsapp-service');

function createEmailTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass },
    tls: { rejectUnauthorized: false }
  });
}

async function sendEmail(to, subject, html) {
  const transporter = createEmailTransporter();
  if (!transporter) {
    console.log('⚠️ Email not configured; skipping email send');
    return { success: false, skipped: true, reason: 'email_not_configured' };
  }
  const result = await transporter.sendMail({
    from: `"ICSRT" <${process.env.EMAIL_USER}>`, to, subject, html
  });
  return { success: true, id: result.messageId };
}

function addAdminCommunicationAPI(app, connectDB) {
  console.log('🔧 Loading Admin Communication API...');

  // WhatsApp utility endpoints
  app.get('/api/admin/whatsapp/status', (req, res) => {
    try {
      const qr = whatsappService.getLastQR();
      return res.json({ success: true, status: whatsappService.getStatus(), hasQR: !!qr, qr });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/admin/whatsapp/init', async (req, res) => {
    try {
      const force = req.query.force === '1' || req.body?.force === true;
      if (force) {
        try { await whatsappService.destroy(); } catch {}
        try { whatsappService.clearSession(); } catch {}
      }
      await whatsappService.initialize();
      return res.json({ success: true, status: whatsappService.getStatus(), hasQR: !!whatsappService.getLastQR() });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/admin/whatsapp/qr', (req, res) => {
    try {
      const qr = whatsappService.getLastQR();
      if (!qr) return res.json({ success: false, error: 'no_qr' });
      return res.json({ success: true, qr });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // Test send endpoint for diagnostics
  app.post('/api/admin/whatsapp/test-send', async (req, res) => {
    try {
      const { phone, message = 'ICSRT test message' } = req.body || {};
      if (!phone) return res.status(400).json({ success: false, error: 'phone_required' });
      if (!whatsappService.isReady) return res.status(400).json({ success: false, error: 'not_ready' });
      const r = await whatsappService.sendMessage(phone, message);
      return res.json({ success: true, result: r });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message, code: e.code || 'send_failed' });
    }
  });

  // Disconnect/Logout and clear session
  app.post('/api/admin/whatsapp/disconnect', async (req, res) => {
    try {
      try { if (whatsappService.client) await whatsappService.client.logout(); } catch {}
      try { await whatsappService.destroy(); } catch {}
      try { whatsappService.clearSession(); } catch {}
      return res.json({ success: true, status: whatsappService.getStatus(), hasQR: !!whatsappService.getLastQR() });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // Send message to customer via selected channels (userpage, email, whatsapp)
  app.post('/api/admin/service-orders/:id/notify', async (req, res) => {
    try {
      const database = await connectDB();
      const { id } = req.params;
      const { message, subject = 'ICSRT Update', channels = ['userpage'], emailOverride, phoneOverride } = req.body || {};
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }

      const order = await database.collection('service-orders').findOne({ _id: new ObjectId(id) });
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      const results = {};
      const now = new Date().toISOString();

      // Always log to userpage if requested
      if (channels.includes('userpage')) {
        const msg = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          sender: 'admin', channel: 'userpage', type: 'text', message: message.trim(), timestamp: now, read: false
        };
        await database.collection('service-orders').updateOne(
          { _id: order._id },
          { $push: { messages: msg }, $set: { lastMessageAt: now, updatedAt: now } }
        );
        results.userpage = { success: true };
      }

      // Email channel
      if (channels.includes('email')) {
        const targetEmail = emailOverride || order.customerInfo?.email || order.userEmail;
        if (targetEmail) {
          try {
            const html = `
              <div style="font-family:Arial,sans-serif">
                <h2 style="color:#2563eb;margin:0 0 12px">${subject}</h2>
                <p style="white-space:pre-line">${message}</p>
                <hr/>
                <p style="color:#6b7280;font-size:12px">Order #${order.orderNumber || order._id}</p>
              </div>`;
            results.email = await sendEmail(targetEmail, subject, html);
          } catch (e) {
            results.email = { success: false, error: e.message };
          }
        } else {
          results.email = { success: false, error: 'no_target_email' };
        }
      }

      // WhatsApp channel
      if (channels.includes('whatsapp')) {
        const targetPhone = phoneOverride || order.customerInfo?.whatsapp || order.customerInfo?.phone;
        if (targetPhone) {
          try {
            if (!whatsappService.isReady) {
              try { await whatsappService.initialize(); } catch {}
            }
            const waMsg = `ICSRT Update (Order #${order.orderNumber || order._id})\n\n${message}`;
            const r = await whatsappService.sendMessage(targetPhone, waMsg);
            results.whatsapp = { success: true, id: r.messageId };
          } catch (e) {
            results.whatsapp = { success: false, error: e.message, code: e.code || 'send_failed' };
          }
        } else {
          results.whatsapp = { success: false, error: 'no_target_phone' };
        }
      }

      return res.json({ success: true, results });
    } catch (error) {
      console.error('Notify error:', error);
      return res.status(500).json({ success: false, error: 'Failed to send notifications' });
    }
  });

  // Change price and optionally notify user via channels
  app.post('/api/admin/service-orders/:id/price-and-notify', async (req, res) => {
    try {
      const database = await connectDB();
      const { id } = req.params;
      const { newPrice, reason, changedBy = 'admin', channels = [], customMessage = '' } = req.body || {};
      if (!newPrice || !reason) {
        return res.status(400).json({ success: false, error: 'newPrice and reason are required' });
      }

      const order = await database.collection('service-orders').findOne({ _id: new ObjectId(id) });
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      const originalAmount = order.originalAmount || order.totalAmount || 0;
      const previousAmount = order.totalAmount || 0;
      const newAmount = parseFloat(newPrice);
      const discountApplied = originalAmount > newAmount ? originalAmount - newAmount : 0;
      const priceChange = newAmount - previousAmount;
      const now = new Date().toISOString();

      const priceHistoryEntry = {
        id: `price-${Date.now()}`,
        previousAmount, newAmount, priceChange, discountApplied,
        reason, changedBy, timestamp: now
      };
      const priceChangeMessage = {
        id: `msg-${Date.now()}-price`, sender: 'system', channel: 'system', type: 'price-update',
        message: `Price ${priceChange >= 0 ? 'increased' : 'decreased'} from $${previousAmount} to $${newAmount}. ${reason}${discountApplied > 0 ? ` (Discount: $${discountApplied})` : ''}`,
        timestamp: now, read: false
      };

      const updateRes = await database.collection('service-orders').updateOne(
        { _id: new ObjectId(id) },
        { $set: { totalAmount: newAmount, originalAmount, discountApplied: discountApplied || null, updatedAt: now }, $push: { priceHistory: priceHistoryEntry, messages: priceChangeMessage } }
      );
      if (updateRes.modifiedCount !== 1) return res.status(500).json({ success: false, error: 'Failed to update price' });

      // Optional notify
      let notifyResults = {};
      if (channels.length > 0) {
        const composed = `${priceChangeMessage.message}${customMessage ? `\n\n${customMessage}` : ''}`;
        const targetEmail = order.customerInfo?.email || order.userEmail;
        const targetPhone = order.customerInfo?.whatsapp || order.customerInfo?.phone;
        if (channels.includes('userpage')) {
          const msg = { id: `msg-${Date.now()}-notify`, sender: 'admin', channel: 'userpage', type: 'text', message: composed, timestamp: now, read: false };
          await database.collection('service-orders').updateOne(
            { _id: order._id }, { $push: { messages: msg }, $set: { lastMessageAt: now, updatedAt: now } }
          );
          notifyResults.userpage = { success: true };
        }
        if (channels.includes('email') && targetEmail) {
          try {
            const html = `<div style=\"font-family:Arial\"><h2 style=\"color:#2563eb\">Order Price Update</h2><p style=\"white-space:pre-line\">${composed}</p></div>`;
            notifyResults.email = await sendEmail(targetEmail, 'ICSRT Order Price Update', html);
          } catch (e) { notifyResults.email = { success: false, error: e.message }; }
        }
        if (channels.includes('whatsapp') && targetPhone) {
          try {
            if (!whatsappService.isReady) { try { await whatsappService.initialize(); } catch {} }
            const waMsg = `ICSRT Order Price Update (Order #${order.orderNumber || order._id})\n\n${composed}`;
            const r = await whatsappService.sendMessage(targetPhone, waMsg);
            notifyResults.whatsapp = { success: true, id: r.messageId };
          } catch (e) { notifyResults.whatsapp = { success: false, error: e.message, code: e.code || 'send_failed' }; }
        }
      }

      const updated = await database.collection('service-orders').findOne({ _id: new ObjectId(id) });
      return res.json({ success: true, order: updated, notifyResults });
    } catch (error) {
      console.error('Price-and-notify error:', error);
      return res.status(500).json({ success: false, error: 'Failed to update price' });
    }
  });
}

module.exports = { addAdminCommunicationAPI };
