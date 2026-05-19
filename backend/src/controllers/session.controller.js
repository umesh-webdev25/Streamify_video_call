import sessionService from "../services/session.service.js";
import ApiResponse from "../utils/apiResponse.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Get all sessions (scoped to logged-in user for privacy)
 */
export const getAllSessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.getUserSessions(req.user._id);
  return ApiResponse.success(res, sessions);
});

/**
 * Get logged in user sessions
 */
export const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.getUserSessions(req.user._id);
  return ApiResponse.success(res, sessions);
});

/**
 * Get single session (ownership verified)
 */
export const getSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await sessionService.getSessionById(id);

  if (session.user._id.toString() !== req.user._id.toString()) {
    throw new AppError("Unauthorized access to this session", 403);
  }

  return ApiResponse.success(res, session);
});

/**
 * Delete session (ownership verified)
 */
export const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await sessionService.getSessionById(id);

  if (session.user._id.toString() !== req.user._id.toString()) {
    throw new AppError("Unauthorized access to this session", 403);
  }

  const response = await sessionService.deleteSession(id);
  return ApiResponse.success(res, null, response.message);
});

/**
 * Delete all sessions of logged in user
 */
export const deleteAllMySessions = asyncHandler(async (req, res) => {
  const response = await sessionService.deleteAllUserSessions(req.user._id);
  return ApiResponse.success(res, null, response.message);
});

/**
 * Invalidate session (ownership verified)
 */
export const invalidateSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await sessionService.getSessionById(id);

  if (session.user._id.toString() !== req.user._id.toString()) {
    throw new AppError("Unauthorized access to this session", 403);
  }

  const updated = await sessionService.invalidateSession(id);
  return ApiResponse.success(res, updated, "Session invalidated successfully");
});