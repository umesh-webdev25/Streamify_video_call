import ScheduleMeeting from "../models/Schedulemeeting.js";
import Group from "../models/group.js";
import NotificationService from "./notification.service.js";

// ==========================
// CREATE MEETING
// ==========================
export const createMeeting = async (meetingData) => {
  try {
    const { groupId, createdBy, title, description, scheduledAt, date, time } = meetingData;

    // Fetch the group to get its members
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found");

    const invitees = group.members.map(m => m.userId);

    const meeting = await ScheduleMeeting.create({
      title,
      description,
      groupId,
      scheduledAt,
      date,
      time,
      createdBy,
      invitees,
      status: "upcoming"
    });

    // Create notifications for all invitees
    if (invitees.length > 0) {
      await Promise.all(invitees.map(async (userId) => {
        // Skip creator
        if (userId.toString() === createdBy.toString()) return;

        await NotificationService.createNotification(userId, {
          title: "New Scheduled Meeting",
          content: `You have been invited to "${title}" in group "${group.groupName}"`,
          type: "meeting_invite",
          data: {
            groupId,
            meetingId: meeting._id
          }
        });
      }));
    }

    return meeting;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==========================
// GET ALL MEETINGS
// ==========================
export const getMeetings = async (userId) => {
  try {
    const meetings = await ScheduleMeeting.find({
      $or: [{ invitees: userId }, { createdBy: userId }]
    }).populate("groupId", "groupName groupImage");

    return meetings;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==========================
// GET MEETING BY ID
// ==========================
export const getMeetingById = async (id) => {
  try {
    const meeting = await ScheduleMeeting.findById(id);

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    return meeting;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==========================
// UPDATE MEETING BY ID
// ==========================
export const updateMeetingById = async (
  id,
  updateData
) => {
  try {
    const updatedMeeting =
      await ScheduleMeeting.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedMeeting) {
      throw new Error("Meeting not found");
    }

    return updatedMeeting;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==========================
// DELETE MEETING BY ID
// ==========================
export const deleteMeetingById = async (id) => {
  try {
    const deletedMeeting =
      await ScheduleMeeting.findByIdAndDelete(id);

    if (!deletedMeeting) {
      throw new Error("Meeting not found");
    }

    return deletedMeeting;
  } catch (error) {
    throw new Error(error.message);
  }
};