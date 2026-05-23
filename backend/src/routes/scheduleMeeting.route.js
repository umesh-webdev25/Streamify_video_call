// routes/scheduleMeeting.route.js

import express from "express";

import {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeetingById,
  deleteMeetingById,
} from "../controllers/scheduleMeeting.controller.js";

const router = express.Router();

/**
 * CREATE MEETING
 */
router.post("/", createMeeting);

/**
 * GET ALL MEETINGS
 */
router.get("/", getMeetings);

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