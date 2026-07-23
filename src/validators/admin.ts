import { z } from "zod";

export const userRoles = ["USER", "MERCHANT", "ADMIN"] as const;

export const updateUserRoleSchema = z.object({
  userId: z.string().trim().min(1, { message: "User id is required." }),
  role: z.enum(userRoles, {
    message: "Select a valid role.",
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
