import { generateStreamToken } from "../lib/stream.js";
import AppError from "../utils/AppError.js";
import GroupMessage from "../models/GroupMessage.js";

class ChatService {
  async getStreamToken(userId) {
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
  async getGroupMessages(groupId) {
    try {
      const messages = await GroupMessage.find({ groupId })
        .sort({ createdAt: 1 })
        .populate("sender", "fullName profilePic");
      return messages;
    } catch (error) {
      throw error;
    }
  }
}

export default new ChatService();
