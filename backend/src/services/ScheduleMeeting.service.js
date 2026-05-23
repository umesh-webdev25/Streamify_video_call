import ScheduleMeeting from "../models/Schedulemeeting.js";

// ==========================
// CREATE MEETING
// ==========================
export const createMeeting = async (meetingData) => {
  try {
    const meeting = await ScheduleMeeting.create(
      meetingData
    );

    return meeting;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==========================
// GET ALL MEETINGS
// ==========================
export const getMeetings = async () => {
  try {
    const meetings = await ScheduleMeeting.find();

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