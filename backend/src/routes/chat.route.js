import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";
import { generateStreamToken } from "../lib/stream.js";

const router = express.Router();

// Protected route used by the frontend
router.get("/token", protectRoute, getStreamToken);

// Dev helper: unauthenticated token generator for quick testing.
// Only enabled when NODE_ENV !== 'production'. Do NOT enable in production.
router.get("/test-token/:userId", (req, res) => {
	if (process.env.NODE_ENV === "production") {
		return res.status(403).json({ message: "Not allowed in production" });
	}

	const { userId } = req.params;
	try {
		const token = generateStreamToken(userId);
		res.status(200).json({ token });
	} catch (error) {
		console.error("Error generating test token:", error && error.message ? error.message : error);
		res.status(500).json({ message: "Could not generate test token" });
	}
});

export default router;
