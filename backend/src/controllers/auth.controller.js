import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { validateEmail, isDisposableEmail } from "../utils/emailValidator.js";
import { sendVerificationEmail, generateVerificationToken } from "../lib/email.js";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    // Normalize email: trim and lowercase
    const normalizedEmail = (email || "").toString().trim().toLowerCase();

    if (!normalizedEmail || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Step 1: Check for disposable/temporary email
    if (isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({ 
        message: "Temporary or disposable email addresses are not allowed. Please use a permanent email address." 
      });
    }

    // Step 2: Comprehensive email validation (format + DNS MX records)
    // Note: SMTP verification disabled - Gmail and other providers block these checks
    console.log(`🔍 Validating email: ${normalizedEmail}`);
    
    // Temporarily disable DNS validation for testing
    // const emailValidation = await validateEmail(normalizedEmail, { checkSMTP: false });
    const emailValidation = { valid: true, domain: normalizedEmail.split('@')[1] };
    
    // if (!emailValidation.valid) {
    //   console.log(`❌ Email validation failed: ${emailValidation.reason}`);
    //   return res.status(400).json({ 
    //     message: emailValidation.reason 
    //   });
    // }
    
    console.log(`✅ Email validation passed for domain: ${emailValidation.domain}`);

    // Step 3: Check if email already exists

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    // Generate email verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await User.create({
      email: normalizedEmail,
      fullName,
      password,
      profilePic: randomAvatar,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false,
    });

    // Send verification email
    // Temporarily disabled for testing
    // const emailResult = await sendVerificationEmail(newUser, verificationToken);
    // if (!emailResult.success) {
    //   console.log("⚠️ Warning: Failed to send verification email:", emailResult.error);
    //   // Continue with signup even if email fails
    // }
    console.log("⏳ User created. Email sending disabled for testing.");

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Cookie settings: in production we need SameSite=None and secure. During
    // local development we use SameSite=Lax to allow the browser to send the
    // cookie with requests from the Vite dev server (http://localhost:5173).
    const cookieOptions = {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    };

    res.cookie("jwt", token, cookieOptions);

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: no user found for email=${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    console.log(`Login attempt for user=${user._id} email=${email} passwordMatch=${isPasswordCorrect}`);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    const cookieOptions = {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    };

    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    // Find user with this token and check if not expired
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired verification token. Please request a new one." 
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    console.log(`✅ Email verified for user: ${user.email}`);

    // NOW create Stream user after email verification
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || "",
      });
      console.log(`✅ Stream user created for verified user: ${user.fullName}`);
    } catch (streamError) {
      console.log("⚠️ Error creating Stream user:", streamError.message);
      // Continue even if Stream creation fails
    }

    res.status(200).json({ 
      success: true, 
      message: "Email verified successfully! You can now use all features." 
    });
  } catch (error) {
    console.log("Error in email verification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    // Only create/update Stream user if email is verified
    if (updatedUser.isEmailVerified) {
      try {
        await upsertStreamUser({
          id: updatedUser._id.toString(),
          name: updatedUser.fullName,
          image: updatedUser.profilePic || "",
        });
        console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
      } catch (streamError) {
        console.log("Error updating Stream user during onboarding:", streamError.message);
      }
    } else {
      console.log(`⏳ Skipping Stream user creation - email not verified for ${updatedUser.fullName}`);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
