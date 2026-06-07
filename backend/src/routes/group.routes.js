import express from "express";
import { uploadGroup } from "../middleware/upload.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
   createGroup,
   getAllGroups,
   getGroupById,
   updateGroup,
   deleteGroup,
   getMyGroups,
   getGroupMeetings,
} from "../controllers/group.controller.js";

const router = express.Router();

router.use(protectRoute);

/**
 * POST  /api/groups
 */
router.post("/",   uploadGroup.single("groupImage"), createGroup);

/**
 * GET   /api/groups
 */
router.get("/", getAllGroups);

router.get("/my-groups", getMyGroups);

/**
 * GET   /api/groups/:id
 */
router.get("/:id", getGroupById);
router.get("/:id/meetings", getGroupMeetings);

/**
 * PUT   /api/groups/:id
 */
router.put("/:id", uploadGroup.single("groupImage"), updateGroup);

/**
 * DELETE /api/groups/:id
 */
router.delete("/:id", deleteGroup);

export default router;