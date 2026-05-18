import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} fullName - User's full name
 */
export const sendOTPEmail = async (email, otp, fullName) => {
  const mailOptions = {
    from: `"Streamify" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Streamify account",
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">

    <div style="text-align: center; margin-bottom: 20px;">
      <img
        src="https://res.cloudinary.com/da50pkdud/image/upload/f_png/v1779081604/ship-wheel_ept251.png"
        alt="Streamify Logo"
        style="
          width: 90px;
          height: 90px;
          object-fit: contain;
        "
      />
    </div>

    <h2 style="color: #4f46e5; text-align: center;">
      Welcome to Streamify!
    </h2>

    <p>Hello <strong>${fullName}</strong>,</p>

    <p>
      Thank you for signing up for Streamify.
      Please use the OTP below:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 5px;
        color: #4f46e5;
        background: #f3f4f6;
        padding: 10px 20px;
        border-radius: 8px;
      ">
        ${otp}
      </span>
    </div>

    <p>
      This OTP is valid for 10 minutes.
    </p>

  </div>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send verification email");
  }
};
