"use server";

/**
 * Business Server Actions
 * -----------------------
 * Session → FormData → Zod → business service.
 * Create/update/delete require a Merchant account (enforced in the service).
 */
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  addBranchForUser,
  createBusiness,
  deleteBusinessForUser,
  updateBusinessForUser,
} from "@/services/business.service";
import {
  addBranchSchema,
  createBusinessSchema,
  updateBusinessSchema,
} from "@/validators/business";

export type BusinessActionState = {
  ok: boolean;
  message: string;
  businessId?: string;
};

function parseBranchesField(raw: FormDataEntryValue | null) {
  if (raw == null || raw === "") return [];
  try {
    const value = JSON.parse(String(raw));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function createFormFields(formData: FormData) {
  return {
    businessName: String(formData.get("businessName") ?? ""),
    description: String(formData.get("description") ?? ""),
    dateEstablishment: String(formData.get("dateEstablishment") ?? ""),
    coverPhoto: String(formData.get("coverPhoto") ?? ""),
    branches: parseBranchesField(formData.get("branches")),
  };
}

function updateFormFields(formData: FormData) {
  return {
    businessName: String(formData.get("businessName") ?? ""),
    description: String(formData.get("description") ?? ""),
    dateEstablishment: String(formData.get("dateEstablishment") ?? ""),
    coverPhoto: String(formData.get("coverPhoto") ?? ""),
  };
}

function refreshDashboard() {
  revalidatePath("/merchant/dashboard");
}

/** Create a business (+ branches) for the logged-in merchant. */
export async function createBusinessAction(
  _prevState: BusinessActionState,
  formData: FormData,
): Promise<BusinessActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  const parsed = createBusinessSchema.safeParse(createFormFields(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const business = await createBusiness(session.user.id, parsed.data);
    refreshDashboard();
    return {
      ok: true,
      message: "Business created.",
      businessId: business.id,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not create business.",
    };
  }
}

/** Update a business owned by the logged-in merchant. */
export async function updateBusinessAction(
  _prevState: BusinessActionState,
  formData: FormData,
): Promise<BusinessActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  const businessId = String(formData.get("businessId") ?? "").trim();
  if (!businessId) {
    return { ok: false, message: "Business id is required." };
  }

  const parsed = updateBusinessSchema.safeParse(updateFormFields(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await updateBusinessForUser(session.user.id, businessId, parsed.data);
    refreshDashboard();
    return { ok: true, message: "Business updated.", businessId };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not update business.",
    };
  }
}

/** Delete a business owned by the logged-in merchant. */
export async function deleteBusinessAction(
  businessId: string,
): Promise<BusinessActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  if (!businessId.trim()) {
    return { ok: false, message: "Business id is required." };
  }

  try {
    await deleteBusinessForUser(session.user.id, businessId);
    refreshDashboard();
    return { ok: true, message: "Business deleted." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not delete business.",
    };
  }
}

/** Add a branch/location to an existing business. */
export async function addBranchAction(
  _prevState: BusinessActionState,
  formData: FormData,
): Promise<BusinessActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  const parsed = addBranchSchema.safeParse({
    businessId: String(formData.get("businessId") ?? ""),
    number: String(formData.get("number") ?? ""),
    building: String(formData.get("building") ?? "") || undefined,
    street: String(formData.get("street") ?? ""),
    barangay: String(formData.get("barangay") ?? ""),
    city: String(formData.get("city") ?? ""),
    province: String(formData.get("province") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const { businessId, ...branch } = parsed.data;
    await addBranchForUser(session.user.id, businessId, branch);
    refreshDashboard();
    return { ok: true, message: "Branch added.", businessId };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not add branch.",
    };
  }
}
