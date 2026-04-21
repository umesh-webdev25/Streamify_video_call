import nodemailer from "nodemailer";
import crypto from "crypto";

/**
 * Create email transporter
 * Configure with your email service provider
 */
function createTransporter() {
  // For development: Use Ethereal (fake SMTP service)
  // For production: Use Gmail, SendGrid, AWS SES, etc.
  
  if (process.env.NODE_ENV === "production") {
    // Production configuration (example with Gmail)
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  } else {
    // Development: Use Ethereal for testing
    // Note: You need to create account at https://ethereal.email/
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
}

/**
 * Generate verification token
 */
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(user, token) {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Streamify" <noreply@streamify.com>',
      to: user.email,
      subject: "✨ Verify Your Email Address - Streamify",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1f2937;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              font-size: 36px;
              font-weight: bold;
              color: #ffffff;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
              margin-bottom: 10px;
            }
            .tagline {
              color: #e9d5ff;
              font-size: 14px;
              letter-spacing: 1px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .message {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .button {
              display: inline-block;
              padding: 16px 48px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 15px 30px rgba(102, 126, 234, 0.5);
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e5e7eb, transparent);
              margin: 30px 0;
            }
            .info-box {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-left: 4px solid #f59e0b;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .info-box-title {
              font-weight: bold;
              color: #92400e;
              margin-bottom: 8px;
            }
            .info-box-text {
              color: #78350f;
              font-size: 14px;
            }
            .features {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 30px 0;
            }
            .feature {
              text-align: center;
              padding: 20px;
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              border-radius: 12px;
            }
            .feature-icon {
              font-size: 32px;
              margin-bottom: 10px;
            }
            .feature-text {
              font-size: 14px;
              color: #4b5563;
              font-weight: 600;
            }
            .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 15px;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-link {
              display: inline-block;
              margin: 0 10px;
              color: #667eea;
              text-decoration: none;
              font-weight: 600;
            }
            .copyright {
              font-size: 12px;
              color: #9ca3af;
            }
            @media only screen and (max-width: 600px) {
              .features { grid-template-columns: 1fr; }
              .content { padding: 30px 20px; }
              .greeting { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <!-- Header -->
            <div class="header">
              <div class="logo">🎥 Streamify</div>
              <div class="tagline">Connect • Chat • Video Call</div>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="greeting">Welcome, ${user.fullName}! 🎉</div>
              
              <p class="message">
                We're thrilled to have you join the <strong>Streamify</strong> community! 
                You're just one step away from connecting with friends through seamless video calls and real-time chat.
              </p>

              <div class="info-box">
                <div class="info-box-title">⏰ Quick Action Required</div>
                <div class="info-box-text">
                  Please verify your email address within the next 24 hours to activate your account.
                </div>
              </div>

              <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>

              <div class="divider"></div>

              <div class="features">
                <div class="feature">
                  <div class="feature-icon">📹</div>
                  <div class="feature-text">HD Video Calls</div>
                </div>
                <div class="feature">
                  <div class="feature-icon">💬</div>
                  <div class="feature-text">Real-time Chat</div>
                </div>
                <div class="feature">
                  <div class="feature-icon">👥</div>
                  <div class="feature-text">Friend Requests</div>
                </div>
                <div class="feature">
                  <div class="feature-icon">🎨</div>
                  <div class="feature-text">Custom Themes</div>
                </div>
              </div>

              <p class="message" style="font-size: 14px; color: #6b7280;">
                <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
                <span style="color: #667eea; word-break: break-all;">${verificationUrl}</span>
              </p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                If you didn't create an account with Streamify, you can safely ignore this email.
              </p>
              <div class="divider"></div>
              <div class="social-links">
                <a href="#" class="social-link">Website</a> •
                <a href="#" class="social-link">Support</a> •
                <a href="#" class="social-link">Privacy Policy</a>
              </div>
              <p class="copyright">
                © 2025 Streamify. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Streamify, ${user.fullName}!
        
        Thank you for signing up. Please verify your email address to complete your registration.
        
        Click this link to verify your email:
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create an account with Streamify, you can safely ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Verification email sent to ${user.email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    // For development with Ethereal
    if (process.env.NODE_ENV !== "production") {
      console.log(`📮 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(user, resetToken) {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Streamify" <noreply@streamify.com>',
      to: user.email,
      subject: "🔐 Reset Your Password - Streamify",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1f2937;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .header {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              font-size: 36px;
              font-weight: bold;
              color: #ffffff;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
              margin-bottom: 10px;
            }
            .tagline {
              color: #fee2e2;
              font-size: 14px;
              letter-spacing: 1px;
            }
            .content {
              padding: 40px 30px;
            }
            .icon-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .lock-icon {
              font-size: 64px;
              display: inline-block;
              animation: shake 0.5s ease-in-out;
            }
            @keyframes shake {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-10deg); }
              75% { transform: rotate(10deg); }
            }
            .greeting {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 20px;
              text-align: center;
            }
            .message {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .button {
              display: inline-block;
              padding: 16px 48px;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 15px 30px rgba(239, 68, 68, 0.5);
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e5e7eb, transparent);
              margin: 30px 0;
            }
            .warning-box {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-left: 4px solid #f59e0b;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .warning-box-title {
              font-weight: bold;
              color: #92400e;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .warning-box-text {
              color: #78350f;
              font-size: 14px;
            }
            .security-box {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border-left: 4px solid #3b82f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .security-title {
              font-weight: bold;
              color: #1e3a8a;
              margin-bottom: 8px;
            }
            .security-text {
              color: #1e40af;
              font-size: 14px;
            }
            .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 15px;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-link {
              display: inline-block;
              margin: 0 10px;
              color: #ef4444;
              text-decoration: none;
              font-weight: 600;
            }
            .copyright {
              font-size: 12px;
              color: #9ca3af;
            }
            @media only screen and (max-width: 600px) {
              .content { padding: 30px 20px; }
              .greeting { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <!-- Header -->
            <div class="header">
              <div class="logo">🎥 Streamify</div>
              <div class="tagline">Secure Password Reset</div>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="icon-container">
                <span class="lock-icon">🔒</span>
              </div>
              
              <div class="greeting">Password Reset Request</div>
              
              <p class="message">
                Hi <strong>${user.fullName}</strong>,
              </p>
              
              <p class="message">
                We received a request to reset your password for your Streamify account. 
                Click the button below to create a new password:
              </p>

              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <div class="warning-box">
                <div class="warning-box-title">
                  ⏰ <span>Time Sensitive</span>
                </div>
                <div class="warning-box-text">
                  This password reset link will expire in <strong>1 hour</strong> for security reasons.
                </div>
              </div>

              <div class="divider"></div>

              <p class="message" style="font-size: 14px; color: #6b7280;">
                <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
                <span style="color: #ef4444; word-break: break-all;">${resetUrl}</span>
              </p>

              <div class="security-box">
                <div class="security-title">🛡️ Security Notice</div>
                <div class="security-text">
                  If you didn't request a password reset, please ignore this email. 
                  Your password will remain unchanged and your account is secure.
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                This is an automated security email from Streamify.
              </p>
              <div class="divider"></div>
              <div class="social-links">
                <a href="#" class="social-link">Help Center</a> •
                <a href="#" class="social-link">Support</a> •
                <a href="#" class="social-link">Privacy Policy</a>
              </div>
              <p class="copyright">
                © 2025 Streamify. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${user.email}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
}
