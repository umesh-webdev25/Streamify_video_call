import express from "express";
import upload from "../middleware/upload.middleware.js";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

/**
 * POST  /api/groups
 * upload.single("groupImage") parses the entire multipart body:
 *   → text fields land in req.body
 *   → the file lands in req.file
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