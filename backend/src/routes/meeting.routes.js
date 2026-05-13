import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  createMeeting,
  getMeeting,
  joinMeeting,
  endMeeting,
  getMeetingToken,
  scheduleMeeting,
  getScheduledMeetings,
} from "../controllers/meeting.controller.js";
import {
  createMeetingSchema,
  joinMeetingSchema,
  scheduleMeetingSchema,
} from "../validators/meeting.validator.js";

const router = express.Router();

router.use(protectRoute);

router.post("/create", validate(createMeetingSchema), createMeeting);
router.get("/:roomId", getMeeting);
router.post("/join", validate(joinMeetingSchema), joinMeeting);
router.delete("/:roomId/end", endMeeting);
router.get("/token", getMeetingToken);
router.post("/schedule", validate(scheduleMeetingSchema), scheduleMeeting);
router.get("/scheduled", getScheduledMeetings);

export default router;
