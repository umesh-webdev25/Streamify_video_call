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

  async addParticipant(roomId, userId) {
    return await Meeting.findOneAndUpdate(
      { roomId },
      {
        $push: {
          participants: { userId, joinedAt: new Date() },
        },
      },
      { new: true }
    );
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
}

export default new MeetingRepository();
