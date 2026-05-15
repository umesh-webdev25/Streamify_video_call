import authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { isDisposableEmail } from "../utils/emailValidator.js";
import AppError from "../utils/AppError.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 */
export const signup = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    throw new AppError("All fields are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  if (isDisposableEmail(normalizedEmail)) {
    throw new AppError("Disposable emails are not allowed", 400);
  }

  let profilePicBase64 = null;
  if (req.file) {
    const fileBase64 = req.file.buffer.toString("base64");
    profilePicBase64 = `data:${req.file.mimetype};base64,${fileBase64}`;
  }

  const user = await authService.signup({ 
    email: normalizedEmail, 
    password, 
    fullName, 
    profilePic: profilePicBase64 
  });
  
  const reqInfo = {
    ip: req.ip,
    device: req.headers["user-agent"],
  };

  const { accessToken, refreshToken } = await authService.createSession(user._id, reqInfo);

  res.cookie("jwt", accessToken, authService.getCookieOptions("access"));
  res.cookie("refreshToken", refreshToken, authService.getCookieOptions("refresh"));
  
  return ApiResponse.success(res, user, "User registered successfully", 201);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const reqInfo = {
    ip: req.ip,
    device: req.headers["user-agent"],
  };

  const { user, accessToken, refreshToken } = await authService.login(email, password, reqInfo);

  res.cookie("jwt", accessToken, authService.getCookieOptions("access"));
  res.cookie("refreshToken", refreshToken, authService.getCookieOptions("refresh"));

  return ApiResponse.success(res, user, "Login successful");
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 */
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken: currentRefreshToken } = req.cookies;

  if (!currentRefreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const { accessToken, refreshToken } = await authService.refreshAccessToken(currentRefreshToken);

  res.cookie("jwt", accessToken, authService.getCookieOptions("access"));
  res.cookie("refreshToken", refreshToken, authService.getCookieOptions("refresh"));

  return ApiResponse.success(res, null, "Token refreshed");
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  res.clearCookie("jwt");
  res.clearCookie("refreshToken");
  return ApiResponse.success(res, null, "Logout successful");
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  await authService.verifyEmail(token);
  return ApiResponse.success(res, null, "Email verified successfully");
});

/**
 * @desc    Onboard user
 * @route   POST /api/auth/onboarding
 */
export const onboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

  if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
    throw new AppError("Missing onboarding fields", 400);
  }

  // ✅ let instead of const — needs reassignment
  let profilePic = "";

  if (req.file) {
    // ✅ diskStorage → use filename, not buffer
    profilePic = `/uploads/${req.file.filename}`;
  } else if (req.body.profilePic) {
    // ✅ random avatar URL sent as text field from frontend
    profilePic = req.body.profilePic;
  }

  const updatedUser = await authService.updateOnboarding(userId, {
    fullName,
    bio,
    nativeLanguage,
    learningLanguage,
    location,
    profilePic,
  });

  return ApiResponse.success(res, updatedUser, "Onboarding completed");
});