import transporter from '../config/mailer';
import { getFrontendUrl } from '../config/env';
import logger from '../utils/logger';
import { enqueueVerificationEmail, enqueuePasswordResetEmail, enqueueGenericEmail } from '../queues/email.queue';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// -------------------------------------------------------------
// Direct SMTP Execution (Used by BullMQ Worker & Fallback)
// -------------------------------------------------------------
export async function sendEmailDirect({ to, subject, html, text }: SendEmailOptions) {
  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'support@icsrt.cloud';
    const mailOptions = {
      from: `"ICSRT Support" <${fromAddress}>`,
      to,
      subject,
      html,
      text
    };
    const result = await transporter.sendMail(mailOptions);
    logger.success(`Email delivered directly to ${to} (MessageId: ${result.messageId})`);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    logger.error(`Failed to deliver email directly to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function sendVerificationEmailDirect(email: string, token: string, name = 'User') {
  const frontendUrl = getFrontendUrl();
  const verifyLink = `${frontendUrl}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1e3a8a; text-align: center;">Welcome to ICSRT!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>

      <p>Or paste this link into your browser:</p>
      <p style="word-break: break-all; color: #4b5563;">${verifyLink}</p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 20px; color: #6b7280; font-size: 13px;">
        <p>If you did not create an account, you can safely ignore this email.</p>
        <p>© ${new Date().getFullYear()} ICSRT. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmailDirect({
    to: email,
    subject: 'Verify Your Email Address - ICSRT',
    html
  });
}

export async function sendPasswordResetEmailDirect(email: string, token: string, name = 'User') {
  const frontendUrl = getFrontendUrl();
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1e3a8a; text-align: center;">Password Reset Request</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #4b5563;">${resetLink}</p>

      <p style="color: #ef4444; font-size: 13px;">This link will expire in 1 hour.</p>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 20px; color: #6b7280; font-size: 13px;">
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>© ${new Date().getFullYear()} ICSRT. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmailDirect({
    to: email,
    subject: 'Password Reset Request - ICSRT',
    html
  });
}

// -------------------------------------------------------------
// Asynchronous Queue-Dispatched Exports (HTTP Non-Blocking)
// -------------------------------------------------------------
export async function sendEmail(options: SendEmailOptions) {
  await enqueueGenericEmail(options);
  return { success: true, queued: true };
}

export async function sendVerificationEmail(email: string, token: string, name = 'User') {
  await enqueueVerificationEmail(email, token, name);
  return { success: true, queued: true };
}

export async function sendPasswordResetEmail(email: string, token: string, name = 'User') {
  await enqueuePasswordResetEmail(email, token, name);
  return { success: true, queued: true };
}
