const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

export class WhatsAppService {
  private client: any = null;
  public isReady = false;
  private qrCodeCallback: ((qr: string) => void) | null = null;
  public isInitializing = false;
  public lastQR: string | null = null;

  async initialize(): Promise<void> {
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

      this.client.on('qr', (qr: string) => {
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

      this.client.on('auth_failure', (msg: any) => {
        console.error('❌ WhatsApp authentication failed:', msg);
        this.isInitializing = false;
        this.isReady = false;
      });

      this.client.on('disconnected', (reason: any) => {
        console.log('🔌 WhatsApp client disconnected:', reason);
        this.isReady = false;
        this.isInitializing = false;
      });

      setTimeout(() => {
        if (this.isInitializing && !this.isReady) {
          console.log('⏰ WhatsApp initialization timeout - resetting state');
          this.isInitializing = false;
        }
      }, 120000);

      await this.client.initialize();
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp client:', error);
      this.isInitializing = false;
      this.isReady = false;
    }
  }

  setQRCodeCallback(callback: (qr: string) => void): void {
    this.qrCodeCallback = callback;
  }

  formatPhoneNumber(phone: string): string | null {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return null;

    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }

    if (cleaned.length === 11 && cleaned.startsWith('01')) {
      cleaned = '2' + cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('1')) {
      cleaned = '20' + cleaned;
    }

    return `${cleaned}@c.us`;
  }

  async sendMessage(phoneNumber: string, message: string): Promise<any> {
    if (!this.isReady) {
      throw new Error('WhatsApp service is not ready. Please scan QR code first.');
    }

    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }

    try {
      console.log(`📱 Sending WhatsApp message to ${formattedNumber}...`);
      const result = await this.client.sendMessage(formattedNumber, message);
      console.log(`✅ WhatsApp message sent to ${formattedNumber}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send WhatsApp message to ${formattedNumber}:`, error);
      throw error;
    }
  }

  getStatus() {
    return {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
      hasQR: !!this.lastQR,
      lastQR: this.lastQR
    };
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.isInitializing = false;
      this.lastQR = null;
      console.log('🔌 WhatsApp client disconnected manually');
    }
  }
}

export default new WhatsAppService();
