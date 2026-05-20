import { z } from "zod";

export const inviteContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    mobileNumber: z.string().trim().optional(),
    designation: z.string().min(1, "Designation is required").trim(),
    groupId: z.string().min(1, "Group ID is required").trim(),
    contactImage: z.string().trim().optional(),
  }),
});
