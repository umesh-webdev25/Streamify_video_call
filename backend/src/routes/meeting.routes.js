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
  createGroupMeeting,
  joinMeetingWithCode,
  endMeetingWithCode,
  shareMeetingToGroup,
  getMeetingByCode,
  requestJoin,
  approveJoinRequest,
  rejectJoinRequest,
  getActiveGroupMeeting,
  joinScheduledMeeting
} from "../controllers/meeting.controller.js";
import {
  createMeetingSchema,
  joinMeetingSchema,
  scheduleMeetingSchema,
  createGroupMeetingSchema,
  joinMeetingWithCodeSchema,
  shareMeetingToGroupSchema
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

// Group Meetings
router.post("/group/create", validate(createGroupMeetingSchema), createGroupMeeting);
router.post("/group/join", validate(joinMeetingWithCodeSchema), joinMeetingWithCode);
router.post("/group/share", validate(shareMeetingToGroupSchema), shareMeetingToGroup);
router.delete("/group/:meetingCode/end", endMeetingWithCode);
router.get("/group/:meetingCode", getMeetingByCode);
router.get("/group/:groupId/active", getActiveGroupMeeting);
router.post("/group/join-scheduled", joinScheduledMeeting);

// Waiting Room
router.post("/request-join", requestJoin);
router.post("/approve-request", approveJoinRequest);
router.post("/reject-request", rejectJoinRequest);

export default router;
