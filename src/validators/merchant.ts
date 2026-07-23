import { z } from "zod";

export const createMerchantSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, { message: "Merchant name is required." })
    .max(150, { message: "Merchant name must not exceed 150 characters." }),
  phoneNumber: z
    .string()
    .trim()
    .min(1, { message: "Phone number is required." })
    .max(12, { message: "Phone number must not exceed 12 characters." })
    .regex(/^\d+$/, {
      message: "Phone number must contain only numeric characters.",
    }),
  taxId: z
    .string()
    .trim()
    .min(1, { message: "TIN is required." })
    .length(12, { message: "TIN must be exactly 12 characters" })
    .regex(/^\d+$/, {
      message: "TIN must contain only numeric characters.",
    }),
});

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;
export const updateMerchantSchema = createMerchantSchema;
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
