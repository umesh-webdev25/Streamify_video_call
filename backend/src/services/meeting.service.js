import crypto from "crypto";
import meetingRepository from "../repositories/meeting.repository.js";
import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";
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
}

export default new MeetingService();
