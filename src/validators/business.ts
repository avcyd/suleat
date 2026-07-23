import { z } from "zod";

const branchSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, { message: "Unit / number is required." })
    .max(50, { message: "Unit / number must not exceed 50 characters." }),
  building: z
    .string()
    .trim()
    .max(150, { message: "Building must not exceed 150 characters." })
    .optional(),
  street: z
    .string()
    .trim()
    .min(1, { message: "Street is required." })
    .max(150, { message: "Street must not exceed 150 characters." }),
  barangay: z
    .string()
    .trim()
    .min(1, { message: "Barangay is required." })
    .max(100, { message: "Barangay must not exceed 100 characters." }),
  city: z
    .string()
    .trim()
    .min(1, { message: "City is required." })
    .max(100, { message: "City must not exceed 100 characters." }),
  province: z
    .string()
    .trim()
    .min(1, { message: "Province is required." })
    .max(100, { message: "Province must not exceed 100 characters." }),
});

const businessFieldsSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, { message: "Business name is required." })
    .max(150, { message: "Business name must not exceed 150 characters." }),
  description: z
    .string()
    .trim()
    .min(1, { message: "Description is required." })
    .max(2000, { message: "Description must not exceed 2000 characters." }),
  dateEstablishment: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Date established must be a valid date (YYYY-MM-DD).",
    }),
  coverPhoto: z
    .string()
    .trim()
    .min(1, { message: "Cover photo is required." })
    .max(500, { message: "Cover photo path must not exceed 500 characters." }),
});

/** Create business + at least one branch (matches Prisma Business + Branch). */
export const createBusinessSchema = businessFieldsSchema.extend({
  branches: z
    .array(branchSchema)
    .min(1, { message: "Add at least one branch." }),
});

/** Update core business fields only (branch edits can come later). */
export const updateBusinessSchema = businessFieldsSchema;

export type BranchInput = z.infer<typeof branchSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
