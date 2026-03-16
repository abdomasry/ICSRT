const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.qrCodeCallback = null;
    this.isInitializing = false;
  this.lastQR = null;
  }

  async initialize() {
    if (this.isInitializing) {
      console.log('⚠️ WhatsApp service is already initializing...');
      return;
    }
    
    if (this.isReady) {
      console.log('✅ WhatsApp service is already ready');
      return;
    }

    this.isInitializing = true;
    console.log('🔄 Initializing WhatsApp client...');

    try {
      // Destroy existing client if any
      if (this.client) {
        await this.client.destroy();
        this.client = null;
      }

      this.client = new Client({
        authStrategy: new LocalAuth({
          name: 'icsrt-whatsapp-session'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        }
      });

      this.client.on('qr', (qr) => {
        console.log('📱 WhatsApp QR Code generated. Please scan with your phone:');
        qrcode.generate(qr, { small: true });
        console.log('🔍 To scan: Open WhatsApp → Settings → Linked Devices → Link a Device');
        
        this.lastQR = qr;
        if (this.qrCodeCallback) {
          this.qrCodeCallback(qr);
        }
      });

      this.client.on('ready', () => {
        console.log('✅ WhatsApp client is ready!');
        console.log('📱 Automatic WhatsApp sending is now available');
        this.isReady = true;
        this.isInitializing = false;
  this.lastQR = null;
      });

      this.client.on('authenticated', () => {
        console.log('🔐 WhatsApp client authenticated successfully!');
      });

      this.client.on('auth_failure', msg => {
        console.error('❌ WhatsApp authentication failed:', msg);
        this.isInitializing = false;
        this.isReady = false;
      });

      this.client.on('disconnected', (reason) => {
        console.log('🔌 WhatsApp client disconnected:', reason);
        this.isReady = false;
        this.isInitializing = false;
      });

      // Set a timeout to reset initialization state if it takes too long
      setTimeout(() => {
        if (this.isInitializing && !this.isReady) {
          console.log('⏰ WhatsApp initialization timeout - resetting state');
          this.isInitializing = false;
        }
      }, 120000); // 2 minutes timeout

      await this.client.initialize();
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp client:', error);
      this.isInitializing = false;
      this.isReady = false;
      throw error;
    }
  }

  async sendMessage(phoneNumber, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready. Please scan QR code first.');
    }

    try {
      const whatsappId = await this.resolveContactId(phoneNumber);
      console.log(`📤 Attempting to send WhatsApp message to: ${whatsappId}`);
      console.log(`📝 Message: ${String(message).substring(0, 100)}...`);

      const result = await this.client.sendMessage(whatsappId, message);
      
      console.log('✅ WhatsApp message sent successfully!', result.id);
      return {
        success: true,
        messageId: result.id,
        timestamp: new Date(),
        to: phoneNumber
      };
    } catch (error) {
      console.error('❌ Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  normalizePhone(input) {
    if (!input) return '';
  let s = String(input).replace(/[^\d+]/g, '');
  // Convert 00 -> +
  if (s.startsWith('00')) s = '+' + s.slice(2);
  // If already has +, keep as is
  if (s.startsWith('+')) return s;
  // Egypt default: local 0XXXXXXXXXX -> +20XXXXXXXXXX
  if (s.startsWith('0')) return '+20' + s.slice(1);
  // Fallback: assume Egypt country code
  return '+20' + s;
  }

  async resolveContactId(phoneNumber) {
    if (!this.client) throw new Error('whatsapp_client_unavailable');
    const intl = this.normalizePhone(phoneNumber);
    const raw = intl.replace('+', '') + '@c.us';
    // Check registration
    try {
      if (typeof this.client.getNumberId === 'function') {
        const id = await this.client.getNumberId(intl.replace('+', ''));
        if (!id) {
          const err = new Error('Target number is not on WhatsApp');
          err.code = 'not_on_whatsapp';
          throw err;
        }
        return id._serialized || id.user + '@c.us';
      }
    } catch (e) {
      if (e?.code === 'not_on_whatsapp') throw e;
      console.warn('getNumberId failed, falling back to raw JID:', e.message);
    }
    return raw;
  }

  getQRCode(callback) {
    this.qrCodeCallback = callback;
  }

  getStatus() {
    return {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
      clientExists: !!this.client
    };
  }

  getLastQR() {
    return this.lastQR;
  }

  clearLastQR() {
    this.lastQR = null;
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.isInitializing = false;
    }
  }

  clearSession() {
    try {
      const base = path.join(process.cwd(), '.wwebjs_auth');
      if (fs.existsSync(base)) {
        fs.rmSync(base, { recursive: true, force: true });
        console.log('🧹 Cleared WhatsApp LocalAuth base folder');
      }
      const cacheBase = path.join(process.cwd(), '.wwebjs_cache');
      if (fs.existsSync(cacheBase)) {
        fs.rmSync(cacheBase, { recursive: true, force: true });
      }
      this.isReady = false;
      this.lastQR = null;
    } catch (err) {
      console.warn('Failed to clear WhatsApp session:', err.message);
    }
  }
}

// Create singleton instance
const whatsappService = new WhatsAppService();

module.exports = whatsappService;
