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

export const createGroupMeetingSchema = z.object({
  body: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

export const joinMeetingWithCodeSchema = z.object({
  body: z.object({
    meetingCode: z.string().min(1, "Meeting Code is required"),
  }),
});

export const shareMeetingToGroupSchema = z.object({
  body: z.object({
    meetingCode: z.string().min(1, "Meeting Code is required"),
    groupId: z.string().min(1, "Group ID is required"),
  }),
});
