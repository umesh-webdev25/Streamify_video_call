import meetingService from "../services/meeting.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

export const createMeeting = asyncHandler(async (req, res) => {
  const result = await meetingService.createMeeting(req.user._id, req.body);
  return ApiResponse.success(res, result, "Meeting created", 201);
});

export const getMeeting = asyncHandler(async (req, res) => {
  const meeting = await meetingService.getMeeting(req.params.roomId);
  return ApiResponse.success(res, meeting);
});

export const joinMeeting = asyncHandler(async (req, res) => {
  const meeting = await meetingService.joinMeeting(
    req.body.roomId,
    req.user._id
  );
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
