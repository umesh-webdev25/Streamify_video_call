import express from "express";
import upload from "../middleware/upload.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
   createGroup,
   getAllGroups,
   getGroupById,
   updateGroup,
   deleteGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.use(protectRoute);

/**
 * POST  /api/groups
 */
router.post("/",   upload.single("groupImage"), createGroup);

/**
 * GET   /api/groups
 */
router.get("/", getAllGroups);

/**
 * GET   /api/groups/:id
 */
router.get("/:id", getGroupById);

/**
 * PUT   /api/groups/:id
 */
router.put("/:id", upload.single("groupImage"), updateGroup);

/**
 * DELETE /api/groups/:id
 */
router.delete("/:id", deleteGroup);

export default router;