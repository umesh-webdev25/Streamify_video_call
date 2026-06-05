import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const onboardingSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    bio: z.string().max(500),
    nativeLanguage: z.string().min(2),
    learningLanguage: z.string().min(2),
    location: z.string().min(2),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const verifyResetOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});
