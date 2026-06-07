import notificationService from "../services/notification.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const notifications = await notificationService.getMyNotifications(req.user._id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });

  return ApiResponse.success(res, notifications);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  return ApiResponse.success(res, { count });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  return ApiResponse.success(res, notification, "Notification marked as read");
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return ApiResponse.success(res, null, "All notifications marked as read");
});
