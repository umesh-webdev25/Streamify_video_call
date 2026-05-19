import userRepository from "../repositories/user.repository.js";
import friendRequestRepository from "../repositories/friendRequest.repository.js";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

class UserService {
  async getRecommendedUsers(user) {
    const friendRequests = await FriendRequest.find({
      $or: [{ sender: user._id }, { recipient: user._id }],
    });

    const excludeIds = new Set(user.friends.map(id => id.toString()));
    for (const req of friendRequests) {
      excludeIds.add(req.sender.toString());
      excludeIds.add(req.recipient.toString());
    }
    excludeIds.add(user._id.toString());

    return await userRepository.findRecommended(user._id, Array.from(excludeIds));
  }

  async getMyFriends(userId) {
    const user = await User.findById(userId)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");
    
    if (!user) throw new AppError("User not found", 404);
    return user.friends;
  }

  async sendFriendRequest(senderId, recipientId) {
    if (senderId === recipientId) {
      throw new AppError("You cannot send a friend request to yourself", 400);
    }

    const recipient = await userRepository.findById(recipientId);
    if (!recipient) throw new AppError("Recipient not found", 404);

    if (recipient.friends.includes(senderId)) {
      throw new AppError("You are already friends", 400);
    }

    const existingRequest = await friendRequestRepository.findExisting(senderId, recipientId);
    if (existingRequest) {
      throw new AppError("A friend request already exists", 400);
    }

    return await friendRequestRepository.create(senderId, recipientId);
  }

  async acceptFriendRequest(requestId, userId) {
    const friendRequest = await friendRequestRepository.findById(requestId);
    if (!friendRequest) throw new AppError("Friend request not found", 404);

    if (friendRequest.recipient.toString() !== userId) {
      throw new AppError("Unauthorized to accept this request", 403);
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Update both users' friends lists
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    return { message: "Friend request accepted" };
  }

  async getFriendRequests(userId) {
    const incomingReqs = await friendRequestRepository.findIncomingPending(userId);
    const acceptedReqs = await friendRequestRepository.findAccepted(userId);
    return { incomingReqs, acceptedReqs };
  }

  async getOutgoingFriendRequests(userId) {
    return await friendRequestRepository.findOutgoingPending(userId);
  }
}

export default new UserService();
