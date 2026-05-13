import jwt from "jsonwebtoken";
import crypto from "crypto";
import userRepository from "../repositories/user.repository.js";
import Session from "../models/Session.js";
import AppError from "../utils/AppError.js";
import { upsertStreamUser } from "../lib/stream.js";
import { generateVerificationToken } from "../lib/email.js";
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
          folder: "streamify_profiles",
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

    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await userRepository.create({
      email,
      fullName,
      password,
      profilePic: profilePicUrl,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // QUEUE: Send verification email
    await queueService.addJob("email", "send-verification", {
      userId: newUser._id,
    });

    return newUser;
  }

  async login(email, password, reqInfo = {}) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.matchPassword(password))) {
      throw new AppError("Invalid email or password", 401);
    }
    
    const tokens = await this.createSession(user._id, reqInfo);
    return { user, ...tokens };
  }

  async createSession(userId, { ip = "unknown", device = "unknown" }) {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = crypto.randomBytes(40).toString("hex");
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await Session.create({
      user: userId,
      refreshToken,
      ipAddress: ip,
      deviceInfo: device,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken) {
    const session = await Session.findOne({ refreshToken, isValid: true });
    
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        session.isValid = false;
        await session.save();
      }
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Token Rotation: Generate new refresh token
    const newAccessToken = this.generateAccessToken(session.user);
    const newRefreshToken = crypto.randomBytes(40).toString("hex");

    session.refreshToken = newRefreshToken;
    await session.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken) {
    await Session.findOneAndUpdate({ refreshToken }, { isValid: false });
  }

  async verifyEmail(token) {
    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // QUEUE: Sync with Stream
    await queueService.addJob("stream-sync", "upsert-user", {
      userId: user._id,
      name: user.fullName,
      image: user.profilePic,
    });

    return user;
  }

  async updateOnboarding(userId, onboardingData) {
    let { profilePic, ...rest } = onboardingData;

    if (profilePic && profilePic.startsWith("data:")) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "streamify_profiles",
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
    if (user.isEmailVerified) {
      await queueService.addJob("stream-sync", "upsert-user", {
        userId: user._id,
        name: user.fullName,
        image: user.profilePic,
      });
    }

    return user;
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
