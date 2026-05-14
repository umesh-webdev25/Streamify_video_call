import Session from "../models/session.js";

class SessionService {
  /**
   * Get all sessions
   */
  async getAllSessions() {
    try {
      const sessions = await Session.find()
        .populate("user", "fullName email profilePic")
        .sort({ createdAt: -1 });

      return sessions;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get sessions by user id
   */
  async getUserSessions(userId) {
    try {
      const sessions = await Session.find({
        user: userId,
      })
        .populate("user", "fullName email profilePic")
        .sort({ createdAt: -1 });

      return sessions;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get single session
   */
  async getSessionById(sessionId) {
    try {
      const session = await Session.findById(sessionId).populate(
        "user",
        "fullName email profilePic"
      );

      if (!session) {
        throw new Error("Session not found");
      }

      return session;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    try {
      const session = await Session.findByIdAndDelete(sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      return {
        success: true,
        message: "Session deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Delete all user sessions
   */
  async deleteAllUserSessions(userId) {
    try {
      await Session.deleteMany({
        user: userId,
      });

      return {
        success: true,
        message: "All sessions deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId) {
    try {
      const session = await Session.findByIdAndUpdate(
        sessionId,
        {
          isValid: false,
        },
        {
          new: true,
        }
      );

      if (!session) {
        throw new Error("Session not found");
      }

      return session;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new SessionService();