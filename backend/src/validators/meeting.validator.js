import { z } from "zod";

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(100).optional(),
    roomId: z.string().min(1).max(50).optional(),
  }),
});

export const joinMeetingSchema = z.object({
  body: z.object({
    roomId: z.string().min(1, "Room ID is required"),
  }),
});

export const scheduleMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(100),
    scheduledAt: z.string().min(1, "Scheduled time is required"),
    inviteeIds: z.array(z.string()).min(1, "At least one invitee is required"),
  }),
});
