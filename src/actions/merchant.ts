"use server";

/**
 * Merchant Server Actions
 * -----------------------
 * Session → FormData → Zod → merchant service.
 * Creating a merchant also upgrades User.role to MERCHANT.
 */
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  createMerchant,
  updateMerchantByUserId,
} from "@/services/merchant.service";
import {
  createMerchantSchema,
  updateMerchantSchema,
} from "@/validators/merchant";

export type MerchantActionState = {
  ok: boolean;
  message: string;
};

function formFields(formData: FormData) {
  return {
    companyName: String(formData.get("companyName") ?? ""),
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    taxId: String(formData.get("taxId") ?? ""),
  };
}

/** Create a Merchant row for the logged-in user (upgrades role to MERCHANT). */
export async function createMerchantAction(
  _prevState: MerchantActionState,
  formData: FormData,
): Promise<MerchantActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  const parsed = createMerchantSchema.safeParse(formFields(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await createMerchant(session.user.id, parsed.data);
    revalidatePath("/merchant/dashboard");
    revalidatePath("/merchants");
    return { ok: true, message: "Merchant profile created." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not create merchant profile.",
    };
  }
}

/** Update the logged-in user's Merchant profile (Account tab). */
export async function updateMerchantAction(
  _prevState: MerchantActionState,
  formData: FormData,
): Promise<MerchantActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  const parsed = updateMerchantSchema.safeParse(formFields(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await updateMerchantByUserId(session.user.id, parsed.data);
    revalidatePath("/merchant/dashboard");
    return { ok: true, message: "Account updated." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not update account.",
    };
  }
}
