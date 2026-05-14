import express from "express";

import {
  getAllSessions,
  getMySessions,
  getSessionById,
  deleteSession,
  deleteAllMySessions,
  invalidateSession,
} from "../controllers/session.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Get all sessions
 */
router.get("/", protectRoute, getAllSessions);

/**
 * Get logged in user sessions
 */
router.get("/me", protectRoute, getMySessions);

/**
 * Get single session
 */
router.get("/:id", protectRoute, getSessionById);

/**
 * Delete single session
 */
router.delete("/:id", protectRoute, deleteSession);

/**
 * Delete all logged in user sessions
 */
router.delete(
  "/me/all",
  protectRoute,
  deleteAllMySessions
);

/**
 * Invalidate session
 */
router.put(
  "/:id/invalidate",
  protectRoute,
  invalidateSession
);

export default router;