import crypto from "crypto";
import meetingRepository from "../repositories/meeting.repository.js";
import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";
import Group from "../models/group.js";
import { generateStreamToken } from "../lib/stream.js";
import notificationService from "./notification.service.js";
import queueService from "./queue.service.js";

class MeetingService {
  async createMeeting(userId, data) {
    const roomId = data.roomId || this.generateRoomId();

    const existing = await meetingRepository.findByRoomId(roomId);
    if (existing) {
      throw new AppError("Room ID already exists", 409);
    }

    const meeting = await meetingRepository.create({
      roomId,
      title: data.title || `Meeting ${roomId}`,
      hostId: userId,
      participants: [{ userId, joinedAt: new Date() }],
      status: "active",
    });

    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/meeting/room/${roomId}`;

    return {
      meeting,
      inviteLink,
      streamToken: this.getVideoToken(userId),
    };
  }

  async getMeeting(roomId) {
    const meeting = await meetingRepository.findByRoomId(roomId);
    if (!meeting) {
      throw new AppError("Meeting not found", 404);
    }
    return meeting;
  }

  async joinMeeting(roomId, userId) {
    const meeting = await meetingRepository.findByRoomId(roomId);
    if (!meeting) {
      throw new AppError("Meeting not found", 404);
    }
    if (meeting.status !== "active") {
      throw new AppError("Meeting is no longer active", 410);
    }

    const alreadyJoined = meeting.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!alreadyJoined) {
      await meetingRepository.addParticipant(roomId, userId);
    }

    return meeting;
  }

  async endMeeting(roomId, userId) {
    const meeting = await meetingRepository.findByRoomId(roomId);
    if (!meeting) {
      throw new AppError("Meeting not found", 404);
    }
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

  async createGroupMeeting(groupId, hostId) {
    const group = await Group.findById(groupId);
    if (!group) throw new AppError("Group not found", 404);
    
    const isMember = group.members.some(m => m.user.toString() === hostId.toString());
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
      activeParticipants: 1
    });

    return { meetingCode, roomId };
  }

  async getMeetingByCode(meetingCode, userId) {
    const meeting = await meetingRepository.findMeetingByCode(meetingCode);
    if (!meeting) throw new AppError("Meeting not found", 404);

    const group = await Group.findById(meeting.groupId);
    const isMember = group?.members.some(m => m.user.toString() === userId.toString());
    if (!isMember) throw new AppError("Not a member of this group", 403);

    return { roomId: meeting.roomId, groupId: meeting.groupId, activeParticipants: meeting.activeParticipants };
  }

  async joinMeetingWithCode(meetingCode, userId) {
    const meeting = await meetingRepository.findMeetingByCode(meetingCode);
    if (!meeting) throw new AppError("Meeting not found", 404);

    const group = await Group.findById(meeting.groupId);
    const isMember = group?.members.some(m => m.user.toString() === userId.toString());
    if (!isMember) throw new AppError("Not a member of this group", 403);

    await meetingRepository.addParticipant(meeting._id, userId);
    
    return { roomId: meeting.roomId, groupId: meeting.groupId, activeParticipants: meeting.activeParticipants + 1 };
  }

  async endMeetingWithCode(meetingCode, userId) {
    const meeting = await meetingRepository.findMeetingByCode(meetingCode);
    if (!meeting) throw new AppError("Meeting not found", 404);
    
    if (meeting.hostId.toString() !== userId.toString()) {
      throw new AppError("Only the host can end the meeting", 403);
    }

    await meetingRepository.endMeetingById(meeting._id);
    return { roomId: meeting.roomId, groupId: meeting.groupId };
  }

  async shareMeetingToGroup(meetingCode, groupId, senderId) {
    const meeting = await meetingRepository.findMeetingByCode(meetingCode);
    if (!meeting) throw new AppError("Meeting not found", 404);

    // Normally create a DB message here. Since there is no message model, we bypass and just return success.
    // The Socket.IO emission will happen in the controller.
    return { success: true, message: { type: "meeting_invite", meta: { meetingCode, lobbyUrl: `/meeting/lobby?code=${meetingCode}` } } };
  }
}

export default new MeetingService();
