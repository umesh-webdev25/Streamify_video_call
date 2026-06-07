import mongoose from "mongoose";
import Meeting from "../models/Meeting.js";

class MeetingRepository {
  async findByRoomId(roomId) {
    return await Meeting.findOne({ roomId });
  }

  async findById(id) {
    return await Meeting.findById(id);
  }

  async create(data) {
    return await Meeting.create(data);
  }

  async updateByRoomId(roomId, updateData) {
    return await Meeting.findOneAndUpdate({ roomId }, updateData, { new: true });
  }

  async markParticipantLeft(roomId, userId) {
    return await Meeting.findOneAndUpdate(
      { roomId, "participants.userId": userId },
      {
        $set: { "participants.$.leftAt": new Date() },
      },
      { new: true }
    );
  }

  async findActiveByUser(userId) {
    return await Meeting.find({
      "participants.userId": userId,
      status: "active",
    }).populate("hostId", "fullName profilePic");
  }

  async findScheduledByUser(userId) {
    return await Meeting.find({
      "participants.userId": userId,
      status: "scheduled",
    })
      .sort({ scheduledAt: 1 })
      .populate("hostId", "fullName profilePic");
  }

  async endMeeting(roomId) {
    return await Meeting.findOneAndUpdate(
      { roomId },
      { status: "ended", endedAt: new Date() },
      { new: true }
    );
  }

  async createMeeting(data) {
    return await Meeting.create(data);
  }

  async findMeetingByCode(meetingCode) {
    return await Meeting.findOne({ meetingCode, status: "active" });
  }

  async findActiveMeetingByGroup(groupId) {
    return await Meeting.findOne({ groupId, status: "active" });
  }

  async addParticipant(roomIdOrId, userId) {
    let query = {};
    if (mongoose.Types.ObjectId.isValid(roomIdOrId)) {
      query = { _id: roomIdOrId };
    } else {
      query = { roomId: roomIdOrId };
    }

    const meeting = await Meeting.findOne(query);
    if (!meeting) return null;

    const existingParticipant = meeting.participants.find(
      (p) => p.userId.toString() === userId.toString() && !p.leftAt
    );

    if (!existingParticipant) {
      meeting.participants.push({ userId, joinedAt: new Date() });
      meeting.activeParticipants = (meeting.activeParticipants || 0) + 1;
      await meeting.save();
    }
    return meeting;
  }

  async removeParticipant(meetingId, userId) {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return null;

    const participant = meeting.participants.find(
      (p) => p.userId.toString() === userId.toString() && !p.leftAt
    );

    if (participant) {
      participant.leftAt = new Date();
      meeting.activeParticipants = Math.max(0, (meeting.activeParticipants || 1) - 1);
      await meeting.save();
    }
    return meeting;
  }

  async endMeetingById(meetingId) {
    return await Meeting.findByIdAndUpdate(
      meetingId,
      { status: "ended", endedAt: new Date() },
      { new: true }
    );
  }

  async findMeetingByRoomId(roomId) {
    return await Meeting.findOne({ roomId });
  }

  async addPendingParticipant(roomIdOrId, userId) {
    let query = {};
    if (mongoose.Types.ObjectId.isValid(roomIdOrId)) {
      query = { _id: roomIdOrId };
    } else {
      query = { roomId: roomIdOrId };
    }

    return await Meeting.findOneAndUpdate(
      query,
      {
        $addToSet: { pendingParticipants: { userId, requestedAt: new Date() } }
      },
      { new: true }
    );
  }

  async removePendingParticipant(roomIdOrId, userId) {
    let query = {};
    if (mongoose.Types.ObjectId.isValid(roomIdOrId)) {
      query = { _id: roomIdOrId };
    } else {
      query = { roomId: roomIdOrId };
    }

    return await Meeting.findOneAndUpdate(
      query,
      {
        $pull: { pendingParticipants: { userId } }
      },
      { new: true }
    );
  }

  async findActiveMeetingByGroup(groupId) {
    return await Meeting.findOne({
      groupId,
      status: "active"
    });
  }
}

export default new MeetingRepository();
