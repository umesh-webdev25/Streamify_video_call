import meetingService from "../services/meeting.service.js";
import authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import Group from "../models/Group.js";
import notificationService from "../services/notification.service.js";

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
  console.log("--> endMeetingWithCode called with code:", meetingCode);
  const result = await meetingService.endMeetingWithCode(meetingCode, req.user._id);
  console.log("--> DB update result:", result);
  
  const io = req.app.get("io");
  if (io && result) {
    io.to(`group:${result.groupId}`).emit("meeting_ended", { meetingCode, groupId: result.groupId });
    
    try {
      const group = await Group.findById(result.groupId);
      if (group) {
        for (const member of group.members) {
          io.to(`user:${member.userId._id || member.userId}`).emit("active_meetings_updated", { groupId: group._id });
        }
      }
    } catch (e) {
      console.error("Failed to emit active_meetings_updated on end:", e.message);
    }
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

  // Send global notification to all group members
  try {
    const group = await Group.findById(groupId).populate("members.userId", "fullName");
    if (group) {
      const adminName = req.user.fullName || "A group member";
      for (const member of group.members) {
        if (member.userId && member.userId._id.toString() === req.user._id.toString()) continue;
        
        await notificationService.send({
          recipientId: member.userId._id || member.userId,
          senderId: req.user._id,
          type: "meeting_invite",
          title: "Group Meeting Started",
          content: `${adminName} has started a video meeting in ${group.groupName}.`,
          metaData: {
            groupId: group._id,
            meetingCode: meetingCode,
            actionUrl: `/meeting/lobby?code=${meetingCode}`
          }
        });
        
        if (io) {
          io.to(`user:${member.userId._id || member.userId}`).emit("active_meetings_updated", { groupId: group._id });
        }
      }
      if (io) {
        io.to(`user:${req.user._id}`).emit("active_meetings_updated", { groupId: group._id });
      }
    }
  } catch (e) {
    console.error("Failed to send meeting started notifications:", e.message);
  }

  return ApiResponse.success(res, result);
});

export const requestJoin = asyncHandler(async (req, res) => {
  const { meetingCode } = req.body;
  const meeting = await meetingService.requestJoin(meetingCode, req.user._id);

  const io = req.app.get("io");
  if (io) {
    // Notify host that someone wants to join
    io.to(`user:${meeting.hostId}`).emit("join_request", {
      meetingId: meeting._id,
      userId: req.user._id,
      userName: req.user.fullName,
      userPic: req.user.profilePic,
    });
  }

  return ApiResponse.success(res, null, "Join request sent to host");
});

export const approveJoinRequest = asyncHandler(async (req, res) => {
  const { meetingId, userId } = req.body;
  const meeting = await meetingService.approveJoinRequest(meetingId, userId, req.user._id);

  const io = req.app.get("io");
  if (io) {
    // Notify the user that they were approved
    io.to(`user:${userId}`).emit("join_approved", {
      meetingId,
      roomId: meeting.roomId
    });
    // Notify host that the user was approved so UI updates
    io.to(`user:${req.user._id}`).emit("join_request_handled", { userId, status: "approved" });
  }

  return ApiResponse.success(res, null, "Join request approved");
});

export const rejectJoinRequest = asyncHandler(async (req, res) => {
  const { meetingId, userId } = req.body;
  await meetingService.rejectJoinRequest(meetingId, userId, req.user._id);

  const io = req.app.get("io");
  if (io) {
    // Notify the user that they were rejected
    io.to(`user:${userId}`).emit("join_rejected", { meetingId });
    // Notify host that the user was rejected so UI updates
    io.to(`user:${req.user._id}`).emit("join_request_handled", { userId, status: "rejected" });
  }

  return ApiResponse.success(res, null, "Join request rejected");
});

export const getActiveGroupMeeting = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const meeting = await meetingService.getActiveGroupMeeting(groupId);
  return ApiResponse.success(res, meeting);
});

export const getAllActiveGroupMeetings = asyncHandler(async (req, res) => {
  console.log("--> getAllActiveGroupMeetings called");
  const meetings = await meetingService.getAllActiveGroupMeetings(req.user._id);
  console.log("--> Returning meetings:", meetings.map(m => ({ id: m._id, code: m.meetingCode, status: m.status })));
  return ApiResponse.success(res, meetings);
});

export const startScheduledMeeting = asyncHandler(async (req, res) => {
  const { scheduleId } = req.body;
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const result = await meetingService.startScheduledMeeting(scheduleId, req.user._id, reqInfo);

  const io = req.app.get("io");
  if (io) {
    io.to(`group:${result.groupId}`).emit("meeting_started", { 
      meetingId: result.scheduleId,
      meetingCode: result.meetingCode, 
      groupId: result.groupId
    });
  }

  res.cookie("refreshToken", result.refreshToken, authService.getCookieOptions("refresh"));
  return ApiResponse.success(res, result, "Scheduled meeting started", 200);
});

export const joinScheduledMeeting = asyncHandler(async (req, res) => {
  const { scheduleId } = req.body;
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const result = await meetingService.joinScheduledMeeting(scheduleId, req.user._id, reqInfo);
  
  if (result.refreshToken) {
    res.cookie("refreshToken", result.refreshToken, authService.getCookieOptions("refresh"));
  }
  
  return ApiResponse.success(res, result, "Joined scheduled meeting");
});
