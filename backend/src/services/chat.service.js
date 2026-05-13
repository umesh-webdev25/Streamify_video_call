import { generateStreamToken } from "../lib/stream.js";
import AppError from "../utils/AppError.js";

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

  // Future: Add methods for creating channels, adding members, etc.
  // These are often done on the frontend but enterprise backends
  // often orchestrate these for security.
}

export default new ChatService();
