import crypto from "crypto";
import meetingRepository from "../repositories/meeting.repository.js";
import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";
import Group from "../models/group.js";
import User from "../models/User.js";
import { generateStreamToken } from "../lib/stream.js";
import notificationService from "./notification.service.js";
import queueService from "./queue.service.js";
import authService from "./auth.service.js";

class MeetingService {
  async verifyMeetingAccess(roomId, userId) {
    const meeting = await meetingRepository.findByRoomId(roomId);
    if (!meeting) {
      throw new AppError("Meeting not found", 404);
    }
    const hostId = meeting.hostId;
    // 1. the host
    if (hostId.toString() === userId.toString()) {
      return meeting;
    }
    // 2. connected contact of the host (friends)
    const hostUser = await User.findById(hostId);
    if (hostUser && hostUser.friends.some((f) => f.toString() === userId.toString())) {
      return meeting;
    }
    // 3. member of the group associated with the meeting
    if (meeting.groupId) {
      const group = await Group.findById(meeting.groupId);
      if (group && !group.isDeleted) {
        const isMember = group.members.some(m => m.userId.toString() === userId.toString());
        if (isMember) {
          return meeting;
        }
      }
    }
    // 4. in the participants list (scheduled or already joined)
    const isParticipant = meeting.participants.some(p => p.userId && p.userId.toString() === userId.toString());
    if (isParticipant) {
      return meeting;
    }
    throw new AppError("You do not have access to this meeting", 403);
  }

  async createMeeting(userId, data, reqInfo) {
    const roomId = data.roomId || this.generateRoomId();

    const existing = await meetingRepository.findByRoomId(roomId);
    if (existing) {
      throw new AppError("Room ID already exists", 409);
    }

    const meeting = await meetingRepository.create({
      roomId,
      meetingCode: data.meetingCode || "STD-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
      title: data.title || `Meeting ${roomId}`,
      hostId: userId,
      participants: [{ userId, joinedAt: new Date() }],
      status: "active",
      waitingRoomEnabled: data.waitingRoomEnabled || false,
    });

    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/meeting/room/${roomId}`;
    const refreshToken = await authService.createMeetingSession(userId, meeting._id, reqInfo || {});

    return {
      meeting,
      inviteLink,
      streamToken: this.getVideoToken(userId),
      refreshToken,
    };
  }

  async getMeeting(roomId, userId) {
    const meeting = await this.verifyMeetingAccess(roomId, userId);
    return meeting;
  }

  async joinMeeting(roomId, userId, reqInfo) {
    const meeting = await this.verifyMeetingAccess(roomId, userId);
    if (meeting.status !== "active") {
      throw new AppError("Meeting is no longer active", 410);
    }

    const alreadyJoined = meeting.participants.some(
      (p) => p.userId && p.userId.toString() === userId.toString()
    );

    if (!alreadyJoined) {
      if (meeting.waitingRoomEnabled && meeting.hostId.toString() !== userId.toString()) {
        throw new AppError("WAITING_ROOM_ENABLED", 403);
      }
      await meetingRepository.addParticipant(roomId, userId);
    }

    const refreshToken = await authService.createMeetingSession(userId, meeting._id, reqInfo || {});

    return { meeting, refreshToken };
  }

  async endMeeting(roomId, userId) {
    const meeting = await this.verifyMeetingAccess(roomId, userId);
    if (meeting.hostId.toString() !== userId.toString()) {
      throw new AppError("Only the host can end the meeting", 403);
    }

    return await meetingRepository.endMeeting(roomId);
  }

  async getVideoToken(userId) {
    try {
      const token = generateStreamToken(userId);
      const apiKey = process.env.STREAM_API_KEY;
      if (!token) throw new AppError("Could not generate stream token", 500);
      return { token, apiKey };
    } catch (error) {
      if (error.message.includes("Stream client is not initialized")) {
        throw new AppError("Stream client configuration missing", 500);
      }
      throw error;
    }
  }

  async scheduleMeeting(userId, data) {
    const { title, scheduledAt, inviteeIds } = data;

    const roomId = this.generateRoomId();

    const participants = [{ userId, joinedAt: new Date() }];
    for (const inviteeId of inviteeIds) {
      participants.push({ userId: inviteeId });
    }

    const meeting = await meetingRepository.create({
      roomId,
      title,
      hostId: userId,
      participants,
      status: "scheduled",
      scheduledAt: new Date(scheduledAt),
    });

    const user = await userRepository.findById(userId);

    for (const inviteeId of inviteeIds) {
      await notificationService.send({
        recipientId: inviteeId,
        senderId: userId,
        type: "system_alert",
        title: "Meeting Invitation",
        content: `${user.fullName} invited you to "${title}" on ${new Date(scheduledAt).toLocaleString()}`,
        metaData: { roomId, meetingId: meeting._id },
      });

      await queueService.addJob("email", "meeting-invite", {
        inviteeId,
        hostName: user.fullName,
        title,
        scheduledAt,
        roomId,
      });
    }

    return meeting;
  }

  async getScheduledMeetings(userId) {
    return await meetingRepository.findScheduledByUser(userId);
  }

  generateRoomId() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
  }

  async createGroupMeeting(groupId, hostId, reqInfo) {
    const group = await Group.findById(groupId);
    if (!group) throw new AppError("Group not found", 404);
    
    const isMember = group.members.some(m => m.userId.toString() === hostId.toString());
    if (!isMember) throw new AppError("Not a member of this group", 403);

    const existing = await meetingRepository.findActiveMeetingByGroup(groupId);
    if (existing) {
      throw new AppError("Meeting already running for this group", 409, { existingCode: existing.meetingCode });
    }

    const meetingCode = "GRP-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const roomId = crypto.randomUUID();

    const meeting = await meetingRepository.createMeeting({
      roomId,
      meetingCode,
      hostId,
      groupId,
      participants: [{ userId: hostId, joinedAt: new Date() }],
      status: "active",
      activeParticipants: 1,
      waitingRoomEnabled: reqInfo.waitingRoomEnabled || false,
    });

    const refreshToken = await authService.createMeetingSession(hostId, meeting._id, reqInfo || {});

    return { meetingCode, roomId, refreshToken };
  }

  async getMeetingByCode(meetingCode, userId) {
    const meeting = await meetingRepository.findMeetingByCode(meetingCode);
    if (!meeting) throw new AppError("Meeting not found", 404);

    const group = await Group.findById(meeting.groupId);
    const isMember = group?.members.some(m => m.user.toString() === userId.toString());
    if (!isMember) throw new AppError("Not a member of this group", 403);

    return { roomId: meeting.roomId, groupId: meeting.groupId, activeParticipants: meeting.activeParticipants };
  }

  async joinMeetingWithCode(meetingCode, userId, reqInfo) {
    const meeting = await meetingRepository.findMeetingByCode(meetingCode);
    if (!meeting) throw new AppError("Meeting not found", 404);

    const group = await Group.findById(meeting.groupId);
    const isMember = group?.members.some(m => m.user.toString() === userId.toString());
    if (!isMember) throw new AppError("Not a member of this group", 403);

    const alreadyJoined = meeting.participants.some(
      (p) => p.userId && p.userId.toString() === userId.toString() && !p.leftAt
    );

    if (!alreadyJoined) {
      if (meeting.waitingRoomEnabled && meeting.hostId.toString() !== userId.toString()) {
        throw new AppError("WAITING_ROOM_ENABLED", 403);
      }
      await meetingRepository.addParticipant(meeting._id, userId);
    }
    
    const refreshToken = await authService.createMeetingSession(userId, meeting._id, reqInfo || {});

    return { roomId: meeting.roomId, groupId: meeting.groupId, activeParticipants: meeting.activeParticipants + 1, refreshToken };
  }

  async endMeetingWithCode(meetingCode, userId) {
    const meeting = await meetingRepository.findMeetingByCode(meetingCode);
    if (!meeting) throw new AppError("Meeting not found", 404);
    
    if (meeting.hostId.toString() !== userId.toString()) {
      throw new AppError("Only the host can end the meeting", 403);
    }

    await meetingRepository.endMeetingById(meeting._id);
  }

  async joinScheduledMeeting(scheduleId, userId, reqInfo) {
    const ScheduleMeeting = (await import("../models/Schedulemeeting.js")).default;
    const schedule = await ScheduleMeeting.findById(scheduleId);
    if (!schedule) throw new AppError("Scheduled meeting not found", 404);

    const { groupId } = schedule;
    
    // Check if there's already an active meeting for this group
    const existing = await meetingRepository.findActiveMeetingByGroup(groupId);
    
    if (existing) {
      // Just join the existing active meeting
      const joinResult = await this.joinMeetingWithCode(existing.meetingCode, userId, reqInfo);
      
      // If this was the scheduled meeting, maybe mark it as completed?
      // Since they are joining it, we could mark it as active or completed. We can leave it or update status.
      if (schedule.status === "upcoming" || schedule.status === "pending") {
        schedule.status = "completed"; // Or just keep it as is.
        await schedule.save();
      }
      
      const tokenData = await this.getVideoToken(userId);
      return { ...joinResult, ...tokenData, meetingCode: existing.meetingCode };
    }

    // No active meeting exists, so we create one using createGroupMeeting
    const createResult = await this.createGroupMeeting(groupId, userId, reqInfo);
    
    // Update schedule to completed
    schedule.status = "completed";
    await schedule.save();

    const tokenData = await this.getVideoToken(userId);
    return { ...createResult, ...tokenData };
  }

  async getActiveGroupMeeting(groupId) {
    const meeting = await meetingRepository.findActiveMeetingByGroup(groupId);
    return meeting;
  }

  async shareMeetingToGroup(meetingCode, groupId, senderId) {
    const meeting = await meetingRepository.findMeetingByCode(meetingCode);
    if (!meeting) throw new AppError("Meeting not found", 404);

    // Normally create a DB message here. Since there is no message model, we bypass and just return success.
    // The Socket.IO emission will happen in the controller.
    return { success: true, message: { type: "meeting_invite", meta: { meetingCode, lobbyUrl: `/meeting/lobby?code=${meetingCode}` } } };
  }

  async requestJoin(meetingCodeOrRoomId, userId) {
    let meeting = await meetingRepository.findMeetingByCode(meetingCodeOrRoomId);
    if (!meeting) {
      meeting = await meetingRepository.findByRoomId(meetingCodeOrRoomId);
    }
    if (!meeting) throw new AppError("Meeting not found", 404);

    if (meeting.status !== "active") {
      throw new AppError("Meeting is no longer active", 410);
    }

    return await meetingRepository.addPendingParticipant(meeting._id, userId);
  }

  async approveJoinRequest(meetingId, userIdToApprove, hostId) {
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) throw new AppError("Meeting not found", 404);
    if (meeting.hostId.toString() !== hostId.toString()) {
      throw new AppError("Only host can approve join requests", 403);
    }

    await meetingRepository.removePendingParticipant(meetingId, userIdToApprove);
    return await meetingRepository.addParticipant(meetingId, userIdToApprove);
  }

  async rejectJoinRequest(meetingId, userIdToReject, hostId) {
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) throw new AppError("Meeting not found", 404);
    if (meeting.hostId.toString() !== hostId.toString()) {
      throw new AppError("Only host can reject join requests", 403);
    }

    return await meetingRepository.removePendingParticipant(meetingId, userIdToReject);
  }

  async getActiveGroupMeeting(groupId) {
    const group = await Group.findById(groupId);
    if (!group) throw new AppError("Group not found", 404);

    return await meetingRepository.findActiveMeetingByGroup(groupId);
  }
}

export default new MeetingService();
