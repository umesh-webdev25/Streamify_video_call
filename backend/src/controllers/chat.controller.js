import chatService from "../services/chat.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

/**
 * @desc    Get Stream Chat/Video token for the current user
 * @route   GET /api/chat/token
 */
export const getStreamToken = asyncHandler(async (req, res) => {
  const result = await chatService.getStreamToken(req.user._id.toString());
  return ApiResponse.success(res, result);
});

/**
 * @desc    Get group messages
 * @route   GET /api/chat/group/:groupId
 */
export const getGroupMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getGroupMessages(req.params.groupId);
  return ApiResponse.success(res, messages);
});
