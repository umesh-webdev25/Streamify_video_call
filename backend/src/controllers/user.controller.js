import userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

/**
 * @desc    Get recommended users for language exchange
 * @route   GET /api/users
 */
export const getRecommendedUsers = asyncHandler(async (req, res) => {
  const users = await userService.getRecommendedUsers(req.user);
  return ApiResponse.success(res, users);
});

/**
 * @desc    Get list of user's friends
 * @route   GET /api/users/friends
 */
export const getMyFriends = asyncHandler(async (req, res) => {
  const friends = await userService.getMyFriends(req.user._id);
  return ApiResponse.success(res, friends);
});

/**
 * @desc    Send a friend request
 * @route   POST /api/users/friend-request/:id
 */
export const sendFriendRequest = asyncHandler(async (req, res) => {
  const request = await userService.sendFriendRequest(req.user._id.toString(), req.params.id);
  return ApiResponse.success(res, request, "Friend request sent", 201);
});

/**
 * @desc    Accept a friend request
 * @route   PUT /api/users/friend-request/:id/accept
 */
export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const result = await userService.acceptFriendRequest(req.params.id, req.user._id.toString());
  return ApiResponse.success(res, null, result.message);
});

/**
 * @desc    Get incoming friend requests
 * @route   GET /api/users/friend-requests
 */
export const getFriendRequests = asyncHandler(async (req, res) => {
  const requests = await userService.getFriendRequests(req.user._id);
  return ApiResponse.success(res, requests);
});

/**
 * @desc    Get outgoing friend requests
 * @route   GET /api/users/outgoing-friend-requests
 */
export const getOutgoingFriendReqs = asyncHandler(async (req, res) => {
  const requests = await userService.getOutgoingFriendRequests(req.user._id);
  return ApiResponse.success(res, requests);
});
