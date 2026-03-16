// Enhanced Service Orders API with complete messaging and user management
const { ObjectId } = require("mongodb");

function addEnhancedServiceOrdersAPI(app, connectDB) {
  console.log("🔧 Loading Enhanced Service Orders API endpoints...");

  // GET enhanced service orders for admin
  app.get('/api/admin/service-orders/enhanced', async (req, res) => {
    console.log("📋 Enhanced service orders request received");
    try {
      const database = await connectDB();
      const { page = 1, limit = 50, status, search, serviceType, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

      // Build a baseQuery that respects search/serviceType but NOT status
      const baseQuery = {};

      // Enhanced search functionality
      if (search) {
        baseQuery.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { serviceName: { $regex: search, $options: 'i' } },
          { serviceType: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { 'customerInfo.name': { $regex: search, $options: 'i' } },
          { 'customerInfo.organization': { $regex: search, $options: 'i' } }
        ];
      }

      // Optional serviceType filter
      if (serviceType && serviceType !== 'all') {
        baseQuery.serviceType = serviceType;
      }

      // List query applies the selected status (if any) on top of base filters
      const listQuery = { ...baseQuery, ...(status && status !== 'all' ? { status } : {}) };
      
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get orders with enhanced customer info
      const orders = await database.collection('service-orders')
        .find(listQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();
      
      // Enhance orders with user information
      const enhancedOrders = await Promise.all(orders.map(async (order) => {
        // Get user info if not available in order
        if (!order.customerInfo && order.userEmail) {
          try {
            const user = await database.collection('users').findOne({ email: order.userEmail });
            if (user) {
              order.customerInfo = {
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Customer',
                email: user.email,
                phone: user.phone || user.mobile || 'Not provided',
                whatsapp: user.whatsapp || user.phone || user.mobile || null,
                country: user.country || 'Not provided',
                organization: user.organization || user.company || 'Not provided',
                designation: user.designation || user.position || user.title || 'Not provided'
              };
            }
          } catch (err) {
            console.log('Could not fetch user info for order:', order._id);
          }
        }
        
        // Ensure required fields exist
        return {
          ...order,
          customerInfo: order.customerInfo || {
            name: 'Unknown Customer',
            email: order.userEmail || 'No email',
            phone: 'Not provided',
            whatsapp: null,
            country: 'Not provided',
            organization: 'Not provided',
            designation: 'Not provided'
          },
          messages: order.messages || [],
          messageStats: {
            total: (order.messages || []).length,
            unread: (order.messages || []).filter(m => m.sender === 'user' && !m.read).length,
            lastMessage: (order.messages || []).length > 0 ? order.messages[order.messages.length - 1] : null
          },
          priceHistory: order.priceHistory || [{
            amount: order.totalAmount || order.originalAmount || 0,
            reason: 'Initial quote',
            changedBy: 'system',
            timestamp: order.submittedAt || order.createdAt || new Date().toISOString()
          }],
          communicationChannels: order.communicationChannels || {
            userpage: true,
            whatsapp: !!(order.customerInfo?.whatsapp),
            email: true
          }
        };
      }));
      
      // Totals for the current list (respecting selected status)
      const totalList = await database.collection('service-orders').countDocuments(listQuery);

      // Base totals by status using a single aggregation to avoid race/off-by-one
      const agg = await database.collection('service-orders').aggregate([
        { $match: baseQuery },
        { $group: { _id: '$status', n: { $sum: 1 } } }
      ]).toArray();
      const counts = { pending: 0, confirmed: 0, 'in-progress': 0, 'ready-for-payment': 0, completed: 0, cancelled: 0 };
      let totalBase = 0;
      for (const row of agg) {
        const key = row._id || 'unknown';
        if (counts[key] != null) counts[key] = row.n;
        totalBase += row.n;
      }

      res.json({
        success: true,
        orders: enhancedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalList / parseInt(limit)),
          totalItems: totalList,
          itemsPerPage: parseInt(limit)
        },
        // Stats that reflect base filters (search/serviceType) but not the selected status
        stats: {
          total: totalBase,
          pending: counts['pending'] || 0,
          confirmed: counts['confirmed'] || 0,
          inProgress: counts['in-progress'] || 0,
          readyForPayment: counts['ready-for-payment'] || 0,
          completed: counts['completed'] || 0,
          cancelled: counts['cancelled'] || 0
        }
      });
    } catch (error) {
      console.error('Error in enhanced service orders API:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch service orders',
        details: error.message 
      });
    }
  });

  // POST - Send message to service order (Admin to User)
  app.post('/api/admin/service-orders/:id/messages', async (req, res) => {
    console.log("💬 Admin sending message to order:", req.params.id);
    try {
      const database = await connectDB();
      const { id } = req.params;
      const { message, sender = 'admin', channel = 'userpage' } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message content is required' });
      }
      
      const messageObj = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender,
        channel,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        delivered: true,
        senderInfo: sender === 'admin' ? 'Admin Team' : 'Customer'
      };
      
      const result = await database.collection('service-orders').updateOne(
        { _id: new ObjectId(id) },
        { 
          $push: { messages: messageObj },
          $set: { 
            lastMessageAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      );
      
      if (result.modifiedCount === 1) {
        res.json({
          success: true,
          message: 'Message sent successfully',
          messageData: messageObj
        });
      } else {
        res.status(404).json({ success: false, error: 'Service order not found' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  });

  // POST - User sends message to service order
  app.post('/api/user/service-orders/:id/messages', async (req, res) => {
    console.log("💬 User sending message to order:", req.params.id);
    try {
      const database = await connectDB();
      const { id } = req.params;
      const { message, userEmail, userName } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message content is required' });
      }
      
      const messageObj = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'user',
        channel: 'userpage',
        message: message.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        delivered: true,
        senderInfo: userName || userEmail || 'Customer'
      };
      
      const result = await database.collection('service-orders').updateOne(
        { _id: new ObjectId(id), userEmail: userEmail },
        { 
          $push: { messages: messageObj },
          $set: { 
            lastMessageAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      );
      
      if (result.modifiedCount === 1) {
        res.json({
          success: true,
          message: 'Message sent successfully',
          messageData: messageObj
        });
      } else {
        res.status(404).json({ success: false, error: 'Service order not found or access denied' });
      }
    } catch (error) {
      console.error('Error sending user message:', error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  });

  // PUT - Update service order price (Enhanced)
  app.put('/api/admin/service-orders/:id/price/enhanced', async (req, res) => {
    console.log("💰 Updating price for order:", req.params.id);
    try {
      const database = await connectDB();
      const { id } = req.params;
      const { newPrice, reason, changedBy = 'admin', discountType = null } = req.body;
      
      if (!newPrice || !reason) {
        return res.status(400).json({ success: false, error: 'New price and reason are required' });
      }
      
      const order = await database.collection('service-orders').findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!order) {
        return res.status(404).json({ success: false, error: 'Service order not found' });
      }
      
      const originalAmount = order.originalAmount || order.totalAmount || 0;
      const previousAmount = order.totalAmount || 0;
      const newAmount = parseFloat(newPrice);
      const discountApplied = originalAmount > newAmount ? originalAmount - newAmount : 0;
      const priceChange = newAmount - previousAmount;
      
      // Create price history entry
      const priceHistoryEntry = {
        id: `price-${Date.now()}`,
        previousAmount,
        newAmount,
        priceChange,
        discountApplied,
        discountType,
        reason,
        changedBy,
        timestamp: new Date().toISOString()
      };
      
      // Create system message
      const systemMessage = {
        id: `msg-${Date.now()}-price`,
        sender: 'system',
        channel: 'system',
        message: `Price ${priceChange >= 0 ? 'increased' : 'decreased'} from $${previousAmount} to $${newAmount}. ${reason}${discountApplied > 0 ? ` (Discount: $${discountApplied})` : ''}`,
        timestamp: new Date().toISOString(),
        read: false,
        senderInfo: 'System'
      };
      
      const result = await database.collection('service-orders').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            totalAmount: newAmount,
            originalAmount: originalAmount,
            discountApplied: discountApplied,
            discountReason: discountApplied > 0 ? reason : null,
            discountType: discountApplied > 0 ? discountType : null,
            priceUpdatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          $push: {
            priceHistory: priceHistoryEntry,
            messages: systemMessage
          }
        }
      );
      
      if (result.modifiedCount === 1) {
        const updatedOrder = await database.collection('service-orders').findOne({ 
          _id: new ObjectId(id) 
        });
        
        res.json({
          success: true,
          message: 'Price updated successfully',
          order: updatedOrder
        });
      } else {
        res.status(500).json({ success: false, error: 'Failed to update price' });
      }
    } catch (error) {
      console.error('Error updating price:', error);
      res.status(500).json({ success: false, error: 'Failed to update price' });
    }
  });

  // PUT - Update service order status
  app.put('/api/admin/service-orders/:id/status', async (req, res) => {
    console.log("📊 Updating status for order:", req.params.id);
    try {
      const database = await connectDB();
      const { id } = req.params;
      const { status, reason = '' } = req.body;
      
      const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold', 'confirmed', 'ready-for-payment'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
        });
      }
      
      const order = await database.collection('service-orders').findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!order) {
        return res.status(404).json({ success: false, error: 'Service order not found' });
      }
      
      // Create status change message
      const statusMessage = {
        id: `msg-${Date.now()}-status`,
        sender: 'system',
        channel: 'system',
        message: `Order status changed from "${order.status}" to "${status}"${reason ? `. Reason: ${reason}` : ''}`,
        timestamp: new Date().toISOString(),
        read: false,
        senderInfo: 'System'
      };
      
      const result = await database.collection('service-orders').updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status,
            statusUpdatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          $push: {
            messages: statusMessage,
            statusHistory: {
              status,
              reason,
              timestamp: new Date().toISOString(),
              changedBy: 'admin'
            }
          }
        }
      );
      
      if (result.modifiedCount === 1) {
        const updatedOrder = await database.collection('service-orders').findOne({ 
          _id: new ObjectId(id) 
        });
        
        res.json({
          success: true,
          message: 'Status updated successfully',
          order: updatedOrder
        });
      } else {
        res.status(500).json({ success: false, error: 'Failed to update status' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ success: false, error: 'Failed to update status' });
    }
  });

  // GET conversation for a specific order
  app.get('/api/admin/service-orders/:id/conversation', async (req, res) => {
    console.log("💬 Getting conversation for order:", req.params.id);
    try {
      const database = await connectDB();
      const { id } = req.params;
      
      const order = await database.collection('service-orders').findOne(
        { _id: new ObjectId(id) },
        { 
          projection: { 
            messages: 1, 
            customerInfo: 1, 
            orderNumber: 1, 
            serviceName: 1,
            status: 1,
            totalAmount: 1
          } 
        }
      );
      
      if (!order) {
        return res.status(404).json({ success: false, error: 'Service order not found' });
      }
      
      const messages = order.messages || [];
      
      res.json({
        success: true,
        conversation: {
          orderInfo: {
            id: order._id,
            orderNumber: order.orderNumber,
            serviceName: order.serviceName,
            status: order.status,
            totalAmount: order.totalAmount,
            customerInfo: order.customerInfo
          },
          messages: messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
          stats: {
            totalMessages: messages.length,
            unreadMessages: messages.filter(m => m.sender === 'user' && !m.read).length,
            adminMessages: messages.filter(m => m.sender === 'admin').length,
            userMessages: messages.filter(m => m.sender === 'user').length,
            systemMessages: messages.filter(m => m.sender === 'system').length
          }
        }
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
    }
  });

  // GET service orders for user (with messaging)
  app.get('/api/user/service-orders', async (req, res) => {
    console.log("📋 User service orders request received");
    try {
      const database = await connectDB();
      const { userEmail } = req.query;
      
      if (!userEmail) {
        return res.status(400).json({ success: false, error: 'User email is required' });
      }
      
      const orders = await database.collection('service-orders')
        .find({ userEmail })
        .sort({ submittedAt: -1 })
        .toArray();
      
      // Enhance orders with message stats
      const enhancedOrders = orders.map(order => ({
        ...order,
        messages: order.messages || [],
        messageStats: {
          total: (order.messages || []).length,
          unread: (order.messages || []).filter(m => m.sender === 'admin' && !m.read).length,
          lastMessage: (order.messages || []).length > 0 ? order.messages[order.messages.length - 1] : null
        }
      }));
      
      res.json({
        success: true,
        orders: enhancedOrders
      });
    } catch (error) {
      console.error('Error fetching user service orders:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch service orders' });
    }
  });

  // GET specific service order for user (with full conversation)
  app.get('/api/user/service-orders/:id', async (req, res) => {
    console.log("📋 User service order details request:", req.params.id);
    try {
      const database = await connectDB();
      const { id } = req.params;
      const { userEmail } = req.query;
      
      if (!userEmail) {
        return res.status(400).json({ success: false, error: 'User email is required' });
      }
      
      const order = await database.collection('service-orders').findOne({ 
        _id: new ObjectId(id),
        userEmail 
      });
      
      if (!order) {
        return res.status(404).json({ success: false, error: 'Service order not found or access denied' });
      }
      
      const enhancedOrder = {
        ...order,
        messages: order.messages || [],
        messageStats: {
          total: (order.messages || []).length,
          unread: (order.messages || []).filter(m => m.sender === 'admin' && !m.read).length,
          lastMessage: (order.messages || []).length > 0 ? order.messages[order.messages.length - 1] : null
        }
      };
      
      res.json({
        success: true,
        order: enhancedOrder
      });
    } catch (error) {
      console.error('Error fetching user service order:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch service order' });
    }
  });

  console.log("✅ Enhanced Service Orders API endpoints loaded successfully");
}

module.exports = { addEnhancedServiceOrdersAPI };
