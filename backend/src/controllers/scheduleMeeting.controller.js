// controllers/scheduleMeeting.controller.js

import * as meetingService from "../services/ScheduleMeeting.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import AppError from "../utils/AppError.js";

/**
 * CREATE MEETING
 */
export const createMeeting = asyncHandler(async (req, res) => {
  const { title, description, groupId, date, time } = req.body;

  if (!groupId) throw new AppError("Group ID is required", 400);

  // Parse date and time into a single Date object for scheduledAt
  const scheduledAt = new Date(`${date}T${time}:00`);

  const meeting = await meetingService.createMeeting({
    title,
    description,
    groupId,
    scheduledAt,
    date,
    time,
    createdBy: req.user._id,
  });

  return ApiResponse.success(
    res,
    meeting,
    "Scheduled meeting created successfully",
    201
  );
});

/**
 * GET ALL MEETINGS
 */
export const getMeetings = asyncHandler(async (req, res) => {
  const meetings = await meetingService.getMeetings(req.user._id);

  return ApiResponse.success(res, meetings);
});

/**
 * GET MEETING BY ID
 */
export const getMeetingById = asyncHandler(
  async (req, res) => {
    const meeting =
      await meetingService.getMeetingById(
        req.params.id
      );

    if (!meeting) {
      throw new AppError("Meeting not found", 404);
    }

    return ApiResponse.success(res, meeting);
  }
);

/**
 * UPDATE MEETING
 */
export const updateMeetingById = asyncHandler(
  async (req, res) => {
    const { title, date, time, status } = req.body;

    const updateData = {
      title,
      date,
      time,
      status,
    };

    const updatedMeeting =
      await meetingService.updateMeetingById(
        req.params.id,
        updateData
      );

    if (!updatedMeeting) {
      throw new AppError("Meeting not found", 404);
    }

    return ApiResponse.success(
      res,
      updatedMeeting,
      "Meeting updated successfully"
    );
  }
);

/**
 * DELETE MEETING
 */
export const deleteMeetingById = asyncHandler(
  async (req, res) => {
    const deletedMeeting =
      await meetingService.deleteMeetingById(
        req.params.id
      );

    if (!deletedMeeting) {
      throw new AppError("Meeting not found", 404);
    }

    return ApiResponse.success(
      res,
      null,
      "Meeting deleted successfully"
    );
  }
);