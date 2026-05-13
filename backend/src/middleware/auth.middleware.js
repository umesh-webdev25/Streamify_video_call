import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Middleware to protect routes and verify JWT
 */
export const protectRoute = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new AppError("Unauthorized - No token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded || !decoded.userId) {
      throw new AppError("Unauthorized - Invalid token", 401);
    }

    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      throw new AppError("Unauthorized - User not found", 401);
    }

    // Pass user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Unauthorized - Token expired", 401);
    }
    throw new AppError("Unauthorized - Invalid token", 401);
  }
});
