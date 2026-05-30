import meetingService from "../services/meeting.service.js";
import authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

export const createMeeting = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const result = await meetingService.createMeeting(req.user._id, req.body, reqInfo);
  res.cookie("refreshToken", result.refreshToken, authService.getCookieOptions("refresh"));
  return ApiResponse.success(res, result, "Meeting created", 201);
});

export const getMeeting = asyncHandler(async (req, res) => {
  const meeting = await meetingService.getMeeting(req.params.roomId, req.user._id);
  return ApiResponse.success(res, meeting);
});

export const joinMeeting = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const { meeting, refreshToken } = await meetingService.joinMeeting(
    req.body.roomId,
    req.user._id,
    reqInfo
  );
  res.cookie("refreshToken", refreshToken, authService.getCookieOptions("refresh"));
  const tokenData = await meetingService.getVideoToken(req.user._id);
  return ApiResponse.success(res, { meeting, ...tokenData });
});

export const endMeeting = asyncHandler(async (req, res) => {
  await meetingService.endMeeting(req.params.roomId, req.user._id);
  return ApiResponse.success(res, null, "Meeting ended");
});

export const getMeetingToken = asyncHandler(async (req, res) => {
  const tokenData = await meetingService.getVideoToken(req.user._id);
  return ApiResponse.success(res, tokenData);
});

export const scheduleMeeting = asyncHandler(async (req, res) => {
  const meeting = await meetingService.scheduleMeeting(req.user._id, req.body);
  return ApiResponse.success(res, meeting, "Meeting scheduled", 201);
});

export const getScheduledMeetings = asyncHandler(async (req, res) => {
  const meetings = await meetingService.getScheduledMeetings(req.user._id);
  return ApiResponse.success(res, meetings);
});

export const createGroupMeeting = asyncHandler(async (req, res) => {
  const { groupId } = req.body;
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const result = await meetingService.createGroupMeeting(groupId, req.user._id, reqInfo);
  res.cookie("refreshToken", result.refreshToken, authService.getCookieOptions("refresh"));
  return ApiResponse.success(res, result, "Group meeting created", 201);
});

export const getMeetingByCode = asyncHandler(async (req, res) => {
  const { meetingCode } = req.params;
  const meeting = await meetingService.getMeetingByCode(meetingCode, req.user._id);
  return ApiResponse.success(res, meeting);
});

export const joinMeetingWithCode = asyncHandler(async (req, res) => {
  const { meetingCode } = req.body;
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const result = await meetingService.joinMeetingWithCode(meetingCode, req.user._id, reqInfo);
  
  const io = req.app.get("io");
  if (io) {
    io.to(`group:${result.groupId}`).emit("meeting_joined", { meetingCode, groupId: result.groupId });
  }

  const tokenData = await meetingService.getVideoToken(req.user._id);
  res.cookie("refreshToken", result.refreshToken, authService.getCookieOptions("refresh"));
  return ApiResponse.success(res, { ...result, ...tokenData });
});

export const endMeetingWithCode = asyncHandler(async (req, res) => {
  const { meetingCode } = req.params;
  const result = await meetingService.endMeetingWithCode(meetingCode, req.user._id);
  
  const io = req.app.get("io");
  if (io) {
    io.to(`group:${result.groupId}`).emit("meeting_ended", { meetingCode, groupId: result.groupId });
  }

  return ApiResponse.success(res, null, "Meeting ended");
});

export const shareMeetingToGroup = asyncHandler(async (req, res) => {
  const { meetingCode, groupId } = req.body;
  const result = await meetingService.shareMeetingToGroup(meetingCode, groupId, req.user._id);
  
  const io = req.app.get("io");
  if (io) {
    io.to(`group:${groupId}`).emit("meeting_started", { 
      meetingCode, 
      groupId, 
      hostId: req.user._id, 
      message: result.message 
    });
  }

  return ApiResponse.success(res, result);
});
