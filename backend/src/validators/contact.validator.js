import { z } from "zod";

export const inviteContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    designation: z.string().min(1, "Designation is required").trim(),
    groupId: z.string().optional(),
  }),
});
