import cron from "node-cron";
import ScheduleMeeting from "../models/Schedulemeeting.js";
import Group from "../models/group.js";
import NotificationService from "./notification.service.js";

let ioInstance = null;

export const setIo = (io) => {
  ioInstance = io;
};

// Check every minute
const meetingReminderCron = cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
    
    // Find upcoming meetings starting in the next 5 minutes
    const upcomingMeetings = await ScheduleMeeting.find({
      status: "upcoming",
      scheduledAt: { $gt: now, $lte: fiveMinutesFromNow }
    }).populate("groupId", "groupName members");

    for (const meeting of upcomingMeetings) {
      if (!meeting.groupId) continue;

      const group = meeting.groupId;
      const meetingIdStr = meeting._id.toString();

      // Emit socket event to the group members
      if (ioInstance) {
        group.members.forEach(member => {
          ioInstance.to(`user:${member.userId.toString()}`).emit("meeting_reminder", {
            meetingId: meetingIdStr,
            title: meeting.title,
            groupName: group.groupName,
            scheduledAt: meeting.scheduledAt
          });
        });
      }

      // Also create a notification in DB for members
      await Promise.all(group.members.map(async (member) => {
        // Option to avoid notifying creator, or just notify everyone
        await NotificationService.createNotification(member.userId, {
          title: "Meeting Reminder",
          content: `The meeting "${meeting.title}" in group "${group.groupName}" is starting in less than 5 minutes!`,
          type: "system_alert",
          data: {
            groupId: group._id,
            meetingId: meetingIdStr
          }
        });
      }));

      // Update status to pending (waiting for host to start/join)
      meeting.status = "pending";
      await meeting.save();
    }
  } catch (error) {
    console.error("Cron Job Error (meetingReminder):", error);
  }
});

export const startCronJobs = () => {
  meetingReminderCron.start();
  console.log("Cron jobs started");
};
