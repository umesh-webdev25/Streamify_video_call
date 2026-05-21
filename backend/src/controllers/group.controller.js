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
    if (typeof m === "string") return { user: m, isAdmin: false };
    return { user: m.user, isAdmin: !!m.isAdmin };
  });
  let adminsList = parseJSON(admins).map(a => typeof a === "string" ? a : a.toString());

  // Ensure creator is in members and admins
  if (!membersList.some(m => m.user.toString() === creatorId.toString())) {
    membersList.push({ user: creatorId, isAdmin: true });
  }
  if (!adminsList.includes(creatorId.toString())) {
    adminsList.push(creatorId.toString());
  }

  const group = await groupService.createGroup({
    groupName,
    groupBio,
    groupImage,
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
  const groups = await groupService.getAllGroups(req.user._id);
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
    updateData.groupImage = `/uploads/${req.file.filename}`;
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