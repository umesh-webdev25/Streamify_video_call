import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
