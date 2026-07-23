"use server";

/**
 * Admin Server Actions
 * --------------------
 * ADMIN-only mutations: user role (access control) and post deletion.
 */
import { revalidatePath, updateTag } from "next/cache";
import { getSession } from "@/lib/session";
import {
  approveMerchantRequest,
  deleteBusiness,
  deleteCompany,
  deletePost,
  rejectMerchantRequest,
  updateUserRole,
} from "@/services/admin.service";
import { updateUserRoleSchema } from "@/validators/admin";

export type AdminActionState = {
  ok: boolean;
  message: string;
};

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "You must be signed in." as const, session: null };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Admin access required." as const, session: null };
  }
  return { error: null, session };
}

function refreshAdmin() {
  revalidatePath("/admin/dashboard");
}

function refreshPublicOffers() {
  updateTag("offers");
  revalidatePath("/");
  revalidatePath("/offers");
}

export async function updateUserRoleAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const gate = await requireAdmin();
  if (gate.error || !gate.session) {
    return { ok: false, message: gate.error ?? "Unauthorized." };
  }

  const parsed = updateUserRoleSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await updateUserRole(gate.session.user.id, parsed.data);
    refreshAdmin();
    return { ok: true, message: "User role updated." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not update user role.",
    };
  }
}

export async function deletePostAction(
  postId: string,
): Promise<AdminActionState> {
  const gate = await requireAdmin();
  if (gate.error || !gate.session) {
    return { ok: false, message: gate.error ?? "Unauthorized." };
  }

  if (!postId.trim()) {
    return { ok: false, message: "Post id is required." };
  }

  try {
    await deletePost(postId);
    refreshAdmin();
    refreshPublicOffers();
    return { ok: true, message: "Post deleted." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not delete post.",
    };
  }
}

export async function deleteCompanyAction(
  merchantId: string,
): Promise<AdminActionState> {
  const gate = await requireAdmin();
  if (gate.error || !gate.session) {
    return { ok: false, message: gate.error ?? "Unauthorized." };
  }

  if (!merchantId.trim()) {
    return { ok: false, message: "Company id is required." };
  }

  try {
    await deleteCompany(merchantId);
    refreshAdmin();
    refreshPublicOffers();
    revalidatePath("/merchants");
    revalidatePath("/merchant/dashboard");
    return { ok: true, message: "Company deleted." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not delete company.",
    };
  }
}

export async function deleteBusinessAction(
  businessId: string,
): Promise<AdminActionState> {
  const gate = await requireAdmin();
  if (gate.error || !gate.session) {
    return { ok: false, message: gate.error ?? "Unauthorized." };
  }

  if (!businessId.trim()) {
    return { ok: false, message: "Business id is required." };
  }

  try {
    await deleteBusiness(businessId);
    refreshAdmin();
    refreshPublicOffers();
    revalidatePath("/merchant/dashboard");
    return { ok: true, message: "Business deleted." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not delete business.",
    };
  }
}

export async function approveMerchantRequestAction(
  merchantId: string,
): Promise<AdminActionState> {
  const gate = await requireAdmin();
  if (gate.error || !gate.session) {
    return { ok: false, message: gate.error ?? "Unauthorized." };
  }

  if (!merchantId.trim()) {
    return { ok: false, message: "Application id is required." };
  }

  try {
    await approveMerchantRequest(merchantId);
    refreshAdmin();
    revalidatePath("/merchants");
    revalidatePath("/merchant/dashboard");
    revalidatePath("/");
    return { ok: true, message: "Merchant application approved." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not approve application.",
    };
  }
}

export async function rejectMerchantRequestAction(
  merchantId: string,
): Promise<AdminActionState> {
  const gate = await requireAdmin();
  if (gate.error || !gate.session) {
    return { ok: false, message: gate.error ?? "Unauthorized." };
  }

  if (!merchantId.trim()) {
    return { ok: false, message: "Application id is required." };
  }

  try {
    await rejectMerchantRequest(merchantId);
    refreshAdmin();
    revalidatePath("/merchants");
    revalidatePath("/");
    revalidatePath("/account");
    return { ok: true, message: "Merchant application rejected." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not reject application.",
    };
  }
}
