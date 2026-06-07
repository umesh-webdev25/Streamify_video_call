// routes/scheduleMeeting.route.js

import express from "express";

import {
  createMeeting,
  getMeetings,
  getScheduledMeetingsByGroup,
  getMeetingById,
  updateMeetingById,
  deleteMeetingById,
} from "../controllers/scheduleMeeting.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

/**
 * CREATE MEETING
 */
router.post("/", createMeeting);

/**
 * GET ALL MEETINGS
 */
router.get("/", getMeetings);

/**
 * GET MEETINGS BY GROUP
 */
router.get("/group/:groupId", getScheduledMeetingsByGroup);

/**
 * GET MEETING BY ID
 */
router.get("/:id", getMeetingById);

/**
 * UPDATE MEETING BY ID
 */
router.put("/:id", updateMeetingById);

/**
 * DELETE MEETING BY ID
 */
router.delete("/:id", deleteMeetingById);

export default router;