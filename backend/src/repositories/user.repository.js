import User from "../models/User.js";

/**
 * User Repository
 * Handles all database operations for the User model
 */
class UserRepository {
  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findByVerificationToken(token) {
    return await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });
  }

  async create(userData) {
    return await User.create(userData);
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findRecommended(currentUserId, excludeIds) {
    return await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: excludeIds } },
        { isOnboarded: true },
      ],
    });
  }
}

export default new UserRepository();
