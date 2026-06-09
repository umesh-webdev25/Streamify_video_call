import * as groupService from "../services/group.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import AppError from "../utils/AppError.js";

/**
 * Helper – safely parse a JSON string sent as a FormData text field.
 * Returns fallback value if parsing fails.
 */
const parseJSON = (value, fallback = []) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Create Group
 * POST /api/groups
 */
export const createGroup = asyncHandler(async (req, res) => {
  const { groupName, groupBio, members, admins, status } = req.body;
  const groupImage = req.file?.path || "";

  const creatorId = req.user._id;
  let membersList = parseJSON(members).map(m => {
    if (typeof m === "string") return { userId: m, role: "member" };
    return { userId: m.userId || m.user, role: m.role || (m.isAdmin ? "admin" : "member") };
  });
  let adminsList = parseJSON(admins).map(a => typeof a === "string" ? a : a.toString());

  // Ensure creator is in members and admins
  if (!membersList.some(m => m.userId.toString() === creatorId.toString())) {
    membersList.push({ userId: creatorId, role: "admin" });
  }
  if (!adminsList.includes(creatorId.toString())) {
    adminsList.push(creatorId.toString());
  }

  const group = await groupService.createGroup({
    groupName,
    groupBio,
    groupImage,
    creator: creatorId,
    status: status || "active",
    members: membersList,
    admins: adminsList,
  });

  return ApiResponse.success(res, group, "Group created successfully", 201);
});

/**
 * Get All Groups
 * GET /api/groups
 */
export const getAllGroups = asyncHandler(async (req, res) => {
  const includeDeleted = req.query.includeDeleted === "true";
  const groups = await groupService.getAllGroups(req.user._id, includeDeleted);
  return ApiResponse.success(res, groups);
});

/**
 * Get Single Group
 * GET /api/groups/:id
 */
export const getGroupById = asyncHandler(async (req, res) => {
  const group = await groupService.getGroupById(req.params.id, req.user._id);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  return ApiResponse.success(res, group);
});

/**
 * Update Group
 * PUT /api/groups/:id
 */
export const updateGroup = asyncHandler(async (req, res) => {
  const { groupName, groupBio, status } = req.body;

  const updateData = { groupName, groupBio };

  if (req.file) {
    updateData.groupImage = req.file.path;
  }

  if (typeof status !== "undefined") {
    updateData.status = status;
  }

  const group = await groupService.updateGroup(req.params.id, req.user._id, updateData);
  if (!group) {
    throw new AppError("Group not found", 404);
  }

  return ApiResponse.success(res, group, "Group updated successfully");
});

/**
 * DELETE Group
 * DELETE /api/groups/:id
 */
export const deleteGroup = asyncHandler(async (req, res) => {
  const group = await groupService.deleteGroup(req.params.id, req.user._id);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  return ApiResponse.success(res, null, "Group deleted successfully");
});

/**
 * Get My Groups
 * GET /api/groups/my-groups
 */
export const getMyGroups = asyncHandler(async (req, res) => {
  const groups = await groupService.getMyGroups(req.user._id);
  return ApiResponse.success(res, groups);
});

/**
 * Get Group Meetings
 * GET /api/groups/:id/meetings
 */
export const getGroupMeetings = asyncHandler(async (req, res) => {
  const ScheduleMeeting = (await import("../models/Schedulemeeting.js")).default;
  const meetings = await ScheduleMeeting.find({
    groupId: req.params.id,
    status: { $in: ["pending", "upcoming"] },
  }).populate("createdBy", "fullName profilePic").sort({ scheduledAt: 1 });

  return ApiResponse.success(res, meetings);
});

/**
 * Update Admin Only Messaging
 * PATCH /api/groups/:id/admin-only-messaging
 */
export const updateAdminOnlyMessaging = asyncHandler(async (req, res) => {
  const { adminOnlyMessaging } = req.body;
  const group = await groupService.getGroupById(req.params.id, req.user._id);

  if (!group) {
    throw new AppError("Group not found", 404);
  }

  // Ensure only admins can update this
  const isAdmin = group.admins.some(
    (a) => a.toString() === req.user._id.toString()
  ) || group.members.some(
    (m) => m.userId.toString() === req.user._id.toString() && m.role === "admin"
  );

  if (!isAdmin) {
    throw new AppError("Only admins can update this setting", 403);
  }

  group.adminOnlyMessaging = adminOnlyMessaging;
  await group.save();

  return ApiResponse.success(res, group, "Admin-only messaging setting updated");
});