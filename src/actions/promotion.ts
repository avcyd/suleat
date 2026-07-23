"use server";

/**
 * Promotion Server Actions — create/update/archive/delete for merchants.
 */
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { saveUploadedImage } from "@/lib/upload";
import {
  archivePromotionForUser,
  createPromotionForUser,
  deletePromotionForUser,
  updatePromotionForUser,
} from "@/services/promotion.service";
import {
  createPromotionSchema,
  updatePromotionSchema,
} from "@/validators/promotion";

export type PromotionActionState = {
  ok: boolean;
  message: string;
  promotionId?: string;
};

function refreshPaths() {
  revalidatePath("/merchant/dashboard");
  revalidatePath("/");
  revalidatePath("/offers");
  revalidatePath("/admin/dashboard");
}

async function resolveImageUrl(formData: FormData): Promise<string | undefined> {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    return saveUploadedImage(file, "promotions");
  }
  const url = String(formData.get("imageUrl") ?? "").trim();
  return url || undefined;
}

function formFields(formData: FormData, imageUrl?: string) {
  return {
    businessId: String(formData.get("businessId") ?? ""),
    branchId: String(formData.get("branchId") ?? ""),
    menuId: String(formData.get("menuId") ?? ""),
    caption: String(formData.get("caption") ?? ""),
    description: String(formData.get("description") ?? ""),
    imageUrl,
    promotionType: String(formData.get("promotionType") ?? ""),
    discountPercent: formData.get("discountPercent")
      ? Number(formData.get("discountPercent"))
      : undefined,
    bundleType: String(formData.get("bundleType") ?? "") || undefined,
    buyQuantity: formData.get("buyQuantity")
      ? Number(formData.get("buyQuantity"))
      : undefined,
    getQuantity: formData.get("getQuantity")
      ? Number(formData.get("getQuantity"))
      : undefined,
    bundleDiscountPercent: formData.get("bundleDiscountPercent")
      ? Number(formData.get("bundleDiscountPercent"))
      : undefined,
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
  };
}

export async function createPromotionAction(
  _prevState: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  try {
    const imageUrl = await resolveImageUrl(formData);
    const parsed = createPromotionSchema.safeParse(
      formFields(formData, imageUrl),
    );
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const created = await createPromotionForUser(
      session.user.id,
      parsed.data,
    );
    refreshPaths();
    return {
      ok: true,
      message: "Promotion created.",
      promotionId: created.id,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not create promotion.",
    };
  }
}

export async function updatePromotionAction(
  _prevState: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  try {
    // Prefer uploaded file; otherwise keep existing URL from the form (hidden field).
    const imageUrl = await resolveImageUrl(formData);
    const parsed = updatePromotionSchema.safeParse({
      ...formFields(formData, imageUrl),
      promotionId: String(formData.get("promotionId") ?? ""),
    });
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    await updatePromotionForUser(session.user.id, parsed.data);
    refreshPaths();
    return {
      ok: true,
      message: "Promotion updated.",
      promotionId: parsed.data.promotionId,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not update promotion.",
    };
  }
}

export async function archivePromotionAction(
  promotionId: string,
): Promise<PromotionActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }
  if (!promotionId.trim()) {
    return { ok: false, message: "Promotion id is required." };
  }

  try {
    await archivePromotionForUser(session.user.id, promotionId);
    refreshPaths();
    return { ok: true, message: "Promotion archived." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not archive promotion.",
    };
  }
}

export async function deletePromotionAction(
  promotionId: string,
): Promise<PromotionActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }
  if (!promotionId.trim()) {
    return { ok: false, message: "Promotion id is required." };
  }

  try {
    await deletePromotionForUser(session.user.id, promotionId);
    refreshPaths();
    return { ok: true, message: "Promotion deleted." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not delete promotion.",
    };
  }
}
