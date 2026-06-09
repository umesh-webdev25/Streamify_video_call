import Notification from "../models/Notification.js";
import Logger from "../utils/logger.js";

class NotificationService {
  setIo(io) {
    this.io = io;
  }

  async send(data) {
    const { recipientId, senderId, type, title, content, metaData } = data;

    try {
      // 1. Create In-app Notification
      const notification = await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type,
        title,
        content,
        data: metaData,
      });

      // 2. Real-time Delivery (Integration with Stream or Sockets)
      this.deliverRealtime(recipientId, notification);

      // 3. Push Notification (Mock)
      this.sendPushNotification(recipientId, notification);

      return notification;
    } catch (error) {
      Logger.error(`Notification Error: ${error.message}`);
    }
  }

  async getMyNotifications(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "fullName profilePic");
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ recipient: userId, isRead: false });
  }

  // Integration points for external delivery
  deliverRealtime(recipientId, notification) {
    try {
      if (this.io) {
        this.io.to(`user:${recipientId}`).emit("new_notification", notification);
        Logger.info(`Realtime notification sent to user:${recipientId}`);
      }
    } catch (e) {
      Logger.error(`Realtime notification error: ${e.message}`);
    }
  }

  sendPushNotification(recipientId, notification) {
    // Integration with Firebase (FCM) or OneSignal
    Logger.info(`Push notification queued for ${recipientId}`);
  }

  async notifyGroupMembers(meeting, group) {
    try {
      const User = (await import("../models/User.js")).default;
      const admin = await User.findById(meeting.createdBy);
      const adminName = admin ? admin.fullName : "An admin";

      for (const member of group.members) {
        // Optional: Skip notifying the creator themselves
        if (member.userId.toString() === meeting.createdBy.toString()) continue;

        await this.send({
          recipientId: member.userId,
          senderId: meeting.createdBy,
          type: "meeting_invite",
          title: "New Group Meeting Scheduled",
          content: `${adminName} scheduled "${meeting.title}" in ${group.groupName} for ${meeting.date} at ${meeting.time}.`,
          metaData: {
            groupId: group._id,
            meetingId: meeting._id,
            scheduledAt: meeting.scheduledAt
          }
        });
      }
    } catch (error) {
      Logger.error(`notifyGroupMembers Error: ${error.message}`);
    }
  }
}

export default new NotificationService();
