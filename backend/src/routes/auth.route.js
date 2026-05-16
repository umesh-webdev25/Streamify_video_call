import express from "express";
import { login, logout, onboard, signup, verifyOTP, resendOTP, refresh } from "../controllers/auth.controller.js";
import ApiResponse from "../utils/apiResponse.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

import validate from "../middleware/validate.middleware.js";
import { signupSchema, loginSchema, onboardingSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

router.post("/onboarding", protectRoute, upload.single("profilePic"), onboard);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  return ApiResponse.success(res, req.user);
});

export default router;
