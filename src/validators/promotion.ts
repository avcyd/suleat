import { z } from "zod";
import { isAllowedImageSrc } from "@/lib/images";

const promotionTypes = ["DISCOUNT", "BUNDLE"] as const;
const bundleTypes = ["FREE", "PERCENTAGE_OFF"] as const;

const basePromotionSchema = z.object({
  businessId: z.string().trim().min(1, { message: "Business is required." }),
  branchId: z.string().trim().min(1, { message: "Branch is required." }),
  menuId: z.string().trim().min(1, { message: "Menu item is required." }),
  caption: z
    .string()
    .trim()
    .min(1, { message: "Caption is required." })
    .max(200, { message: "Caption must not exceed 200 characters." }),
  description: z
    .string()
    .trim()
    .min(1, { message: "Description is required." })
    .max(2000, { message: "Description must not exceed 2000 characters." }),
  imageUrl: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .refine((value) => !value || isAllowedImageSrc(value), {
      message: "Image must be a site path or an http(s) URL.",
    }),
  promotionType: z.enum(promotionTypes, {
    message: "Select a valid promotion type.",
  }),
  discountPercent: z.coerce.number().int().min(1).max(100).optional(),
  bundleType: z.enum(bundleTypes).optional(),
  buyQuantity: z.coerce.number().int().min(1).optional(),
  getQuantity: z.coerce.number().int().min(1).optional(),
  bundleDiscountPercent: z.coerce.number().int().min(1).max(100).optional(),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Start date is required." }),
  endDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "End date is required." }),
});

function refinePromotion(
  data: z.infer<typeof basePromotionSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.endDate < data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be on or after the start date.",
      path: ["endDate"],
    });
  }

  if (data.promotionType === "DISCOUNT") {
    if (data.discountPercent == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount percent is required.",
        path: ["discountPercent"],
      });
    }
  } else {
    if (!data.bundleType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bundle type is required.",
        path: ["bundleType"],
      });
    }
    if (data.buyQuantity == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Buy quantity is required.",
        path: ["buyQuantity"],
      });
    }
    if (data.bundleType === "FREE" && data.getQuantity == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Get quantity is required.",
        path: ["getQuantity"],
      });
    }
    if (
      data.bundleType === "PERCENTAGE_OFF" &&
      data.bundleDiscountPercent == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bundle discount percent is required.",
        path: ["bundleDiscountPercent"],
      });
    }
  }
}

export const createPromotionSchema = basePromotionSchema.superRefine(
  refinePromotion,
);

export const updatePromotionSchema = basePromotionSchema
  .extend({
    promotionId: z.string().trim().min(1, { message: "Promotion id is required." }),
  })
  .superRefine(refinePromotion);

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
