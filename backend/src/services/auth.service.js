import jwt from "jsonwebtoken";
import crypto from "crypto";
import userRepository from "../repositories/user.repository.js";
import meetingRepository from "../repositories/meeting.repository.js";
import Session from "../models/Session.js";
import AppError from "../utils/AppError.js";
import { upsertStreamUser } from "../lib/stream.js";
import bcrypt from "bcryptjs";
import { sendOTPEmail, send2FAEmail } from "./email.service.js";
import { sendPasswordResetOtpEmail } from "../lib/email.js";
import queueService from "./queue.service.js";
import cloudinary from "../lib/cloudinary.js";

class AuthService {
  async signup(userData) {
    const { email, fullName, password, profilePic } = userData;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    let profilePicUrl = "";
    if (profilePic) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "MeetFlow_profiles",
        });
        profilePicUrl = uploadResponse.secure_url;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new AppError("Failed to upload profile image", 500);
      }
    } else {
      const idx = Math.floor(Math.random() * 100) + 1;
      profilePicUrl = `https://avatar.iran.liara.run/public/${idx}.png`;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await userRepository.create({
      email,
      fullName,
      password,
      profilePic: profilePicUrl,
      emailOTP: hashedOTP,
      otpExpires,
      isVerified: false,
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, fullName);
    } catch (error) {
      console.error("Failed to send initial OTP email:", error);
    }

    return newUser;
  }

  async login(email, password, reqInfo = {}) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.matchPassword(password))) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isVerified) {
      throw new AppError("Your email is not verified. Please verify your email to login.", 403);
    }

    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = await bcrypt.hash(otp, 10);
      user.emailOTP = hashedOTP;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await send2FAEmail(email, otp, user.fullName);
      } catch (error) {
        console.error("Failed to send 2FA OTP email:", error);
        throw new AppError("Failed to send verification email. Please check your email server config or try again later.", 500);
      }

      return { requiresTwoFactor: true, email: user.email };
    }

    return { user, accessToken: this.generateAccessToken(user._id) };
  }

  async verify2FA(email, otp, reqInfo = {}) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError("User not found", 404);

    if (!user.twoFactorEnabled) throw new AppError("2FA is not enabled for this account", 400);

    if (!user.emailOTP || !user.otpExpires || user.otpExpires < new Date()) {
      throw new AppError("OTP has expired. Please log in again.", 400);
    }

    const isMatch = await bcrypt.compare(otp, user.emailOTP);
    if (!isMatch) throw new AppError("Invalid OTP code", 400);

    user.emailOTP = null;
    user.otpExpires = null;
    await user.save();

    return { user, accessToken: this.generateAccessToken(user._id) };
  }

  async toggle2FA(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    return user;
  }

  async verifyOTP(email, otp) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
      throw new AppError("Email is already verified", 400);
    }

    if (!user.emailOTP || !user.otpExpires || user.otpExpires < new Date()) {
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    const isMatch = await bcrypt.compare(otp, user.emailOTP);
    if (!isMatch) {
      throw new AppError("Invalid OTP code", 400);
    }

    user.isVerified = true;
    user.emailOTP = null;
    user.otpExpires = null;
    await user.save();

    // Sync with Stream after verification
    await queueService.addJob("stream-sync", "upsert-user", {
      userId: user._id,
      name: user.fullName,
      image: user.profilePic,
    });

    return user;
  }

  async resendOTP(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
      throw new AppError("Email is already verified", 400);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    user.emailOTP = hashedOTP;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, otp, user.fullName);
    return true;
  }

  async createMeetingSession(userId, meetingId, { ip = "unknown", userAgent = "unknown", device = "unknown" }) {
    const randomToken = crypto.randomBytes(40).toString("hex");
    const hashedToken = await bcrypt.hash(randomToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const session = await Session.create({
      userId,
      meetingId,
      refreshToken: hashedToken,
      ipAddress: ip,
      userAgent,
      deviceInfo: device,
      expiresAt,
      revoked: false,
      lastActivity: new Date()
    });

    return `${session._id}.${randomToken}`;
  }

  async refreshAccessToken(plainRefreshToken) {
    if (!plainRefreshToken || !plainRefreshToken.includes('.')) {
      throw new AppError("Invalid refresh token format", 401);
    }

    const [sessionId, plainToken] = plainRefreshToken.split('.');

    const session = await Session.findById(sessionId).populate("meetingId");

    if (!session || session.revoked || session.expiresAt < new Date()) {
      throw new AppError("Invalid or expired session", 401);
    }

    const isMatch = await bcrypt.compare(plainToken, session.refreshToken);
    if (!isMatch) {
      session.revoked = true;
      await session.save();
      throw new AppError("Invalid refresh token", 401);
    }

    const meeting = session.meetingId;
    if (!meeting || meeting.status !== "active") {
      throw new AppError("Meeting session is no longer active", 401);
    }

    session.lastActivity = new Date();

    const newRandomToken = crypto.randomBytes(40).toString("hex");
    const newHashedToken = await bcrypt.hash(newRandomToken, 10);

    session.refreshToken = newHashedToken;
    await session.save();

    const newAccessToken = this.generateAccessToken(session.userId);
    const newRefreshToken = `${session._id}.${newRandomToken}`;

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(plainRefreshToken) {
    if (!plainRefreshToken || !plainRefreshToken.includes('.')) return;
    const [sessionId] = plainRefreshToken.split('.');
    await Session.findByIdAndUpdate(sessionId, { revoked: true });
  }

  async updateOnboarding(userId, onboardingData) {
    let { profilePic, ...rest } = onboardingData;

    if (profilePic && (profilePic.startsWith("data:") || profilePic.startsWith("/uploads/") || profilePic.startsWith("uploads/"))) {
      try {
        const uploadPath = profilePic.startsWith("data:") ? profilePic : `./${profilePic.startsWith("/") ? "" : "/"}${profilePic}`;
        const uploadResponse = await cloudinary.uploader.upload(uploadPath, {
          folder: "MeetFlow_profiles",
        });
        profilePic = uploadResponse.secure_url;
      } catch (error) {
        console.error("Cloudinary upload error in onboarding:", error);
        throw new AppError("Failed to upload profile image", 500);
      }
    }

    const user = await userRepository.updateById(userId, {
      ...rest,
      profilePic,
      isOnboarded: true,
    });

    if (!user) throw new AppError("User not found", 404);

    // Sync with Stream if verified
    if (user.isVerified) {
      await queueService.addJob("stream-sync", "upsert-user", {
        userId: user._id,
        name: user.fullName,
        image: user.profilePic,
      });
    }

    return user;
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    user.resetPasswordOtp = hashedOTP;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendPasswordResetOtpEmail(user, otp);
    return true;
  }

  async verifyResetOtp(email, otp) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError("User not found", 404);

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isMatch) throw new AppError("Invalid OTP code", 400);

    // Generate secure temporary reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    return resetToken;
  }

  async resetPassword(resetToken, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return true;
  }

  generateAccessToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15m", // Short-lived
    });
  }

  getCookieOptions(type = "access") {
    const isRefresh = type === "refresh";
    return {
      maxAge: isRefresh ? 30 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    };
  }
}

export default new AuthService();
