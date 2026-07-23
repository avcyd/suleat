import { z } from "zod";
import { isAllowedImageSrc } from "@/lib/images";

const branchSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, { message: "Unit or number is required." })
    .max(50, { message: "Unit or number must not exceed 50 characters." }),
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

function todayYmd() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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
    })
    .refine((value) => value <= todayYmd(), {
      message: "Establishment date cannot be in the future.",
    }),
  coverPhoto: z
    .string()
    .trim()
    .min(1, { message: "Cover photo is required." })
    .max(2000, { message: "Cover photo URL is too long." })
    .refine(isAllowedImageSrc, {
      message: "Cover photo must be a site path or an http(s) image URL.",
    }),
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

export { branchSchema };

export const addBranchSchema = branchSchema.extend({
  businessId: z.string().trim().min(1, { message: "Business is required." }),
});

export type AddBranchInput = z.infer<typeof addBranchSchema>;
