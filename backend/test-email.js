/**
 * Email Test Script
 * Tests if your email configuration is working
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testEmail() {
  console.log("🧪 Testing Email Configuration...\n");

  // Check environment variables
  console.log("📋 Configuration Status:");
  console.log("=".repeat(60));
  console.log(`EMAIL_HOST:     ${process.env.EMAIL_HOST || "❌ NOT SET"}`);
  console.log(`EMAIL_USER:     ${process.env.EMAIL_USER || "❌ NOT SET"}`);
  console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? "✅ SET" : "❌ NOT SET"}`);
  console.log(`EMAIL_FROM:     ${process.env.EMAIL_FROM || "❌ NOT SET"}`);
  console.log(`FRONTEND_URL:   ${process.env.FRONTEND_URL || "❌ NOT SET"}`);
  console.log(`NODE_ENV:       ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(60));

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log("\n❌ Email is NOT configured!");
    console.log("\n📝 To fix this:");
    console.log("1. Run: node setup-email.js");
    console.log("2. Or manually update your .env file");
    console.log("3. See EMAIL_SETUP_GUIDE.md for detailed instructions");
    return;
  }

  console.log("\n✅ Email credentials are configured!\n");

  // Create transporter
  console.log("🔌 Testing connection to email server...");

  const isProduction = process.env.NODE_ENV === "production";
  
  const transporter = nodemailer.createTransport(
    isProduction
      ? {
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        }
      : {
          host: process.env.EMAIL_HOST || "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        }
  );

  try {
    await transporter.verify();
    console.log("✅ Successfully connected to email server!\n");

    // Send test email
    console.log("📧 Sending test email...");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Streamify Test" <noreply@streamify.com>',
      to: process.env.EMAIL_USER, // Send to yourself
      subject: "✅ Streamify Email Test - Success!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { background-color: #10b981; color: white; padding: 15px; border-radius: 5px; text-align: center; }
            .info { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">
              <h2>✅ Email Test Successful!</h2>
            </div>
            <div class="info">
              <h3>Configuration Details:</h3>
              <p><strong>Email Host:</strong> ${process.env.EMAIL_HOST}</p>
              <p><strong>Email User:</strong> ${process.env.EMAIL_USER}</p>
              <p><strong>Environment:</strong> ${process.env.NODE_ENV || "development"}</p>
              <p><strong>Frontend URL:</strong> ${process.env.FRONTEND_URL}</p>
            </div>
            <p>Your email verification system is working correctly! 🎉</p>
            <p>Users will receive similar emails when they sign up.</p>
          </div>
        </body>
        </html>
      `,
      text: `
✅ Email Test Successful!

Your email verification system is working correctly!

Configuration:
- Email Host: ${process.env.EMAIL_HOST}
- Email User: ${process.env.EMAIL_USER}
- Environment: ${process.env.NODE_ENV || "development"}
- Frontend URL: ${process.env.FRONTEND_URL}

Users will receive similar emails when they sign up.
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log(`📧 Message ID: ${info.messageId}`);

    if (process.env.NODE_ENV !== "production") {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📮 Preview URL: ${previewUrl}`);
        console.log("\n💡 Open this URL to view the test email (Ethereal only)");
      }
    } else {
      console.log("\n💡 Check your inbox for the test email");
    }

    console.log("\n🎉 Everything is working correctly!");
    console.log("\n📝 Next Steps:");
    console.log("1. Your email system is ready to use");
    console.log("2. Test user signup to verify end-to-end flow");
    console.log("3. Users will receive verification emails when they sign up");

  } catch (error) {
    console.error("\n❌ Email test failed!");
    console.error(`Error: ${error.message}\n`);

    console.log("🔧 Troubleshooting:");
    
    if (error.code === "EAUTH") {
      console.log("❌ Authentication failed");
      console.log("   - For Gmail: Make sure you're using an App Password, not your regular password");
      console.log("   - Create one at: https://myaccount.google.com/apppasswords");
      console.log("   - Enable 2FA first if not already enabled");
    } else if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      console.log("❌ Cannot connect to email server");
      console.log("   - Check your internet connection");
      console.log("   - Verify EMAIL_HOST is correct");
      console.log("   - Your network might be blocking the connection");
    } else if (error.code === "ESOCKET") {
      console.log("❌ Socket error");
      console.log("   - Email server might be down");
      console.log("   - Try again in a few minutes");
    } else {
      console.log("   - Check your .env file configuration");
      console.log("   - See EMAIL_SETUP_GUIDE.md for help");
    }

    console.log("\n📝 Run this for quick setup:");
    console.log("   node setup-email.js");
  }
}

testEmail();
