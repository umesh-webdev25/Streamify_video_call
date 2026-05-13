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
