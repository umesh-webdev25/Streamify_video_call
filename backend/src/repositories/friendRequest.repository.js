import FriendRequest from "../models/FriendRequest.js";

class FriendRequestRepository {
  async findById(id) {
    return await FriendRequest.findById(id);
  }

  async findExisting(senderId, recipientId) {
    return await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    });
  }

  async create(senderId, recipientId) {
    return await FriendRequest.create({
      sender: senderId,
      recipient: recipientId,
    });
  }

  async findIncomingPending(userId) {
    return await FriendRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");
  }

  async findOutgoingPending(userId) {
    return await FriendRequest.find({
      sender: userId,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");
  }

  async findAccepted(userId) {
    return await FriendRequest.find({
      sender: userId,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");
  }
}

export default new FriendRequestRepository();
