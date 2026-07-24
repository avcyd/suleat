"use server";

/**
 * Public offer/business reads for client overlays (no auth).
 */
import { getCachedPublicBusiness } from "@/lib/offers-cache";
import type { PublicBusinessView } from "@/types/public-business";

export type PublicBusinessActionState = {
  ok: boolean;
  message: string;
  business?: PublicBusinessView;
};

export async function getPublicBusinessAction(
  businessId: string,
): Promise<PublicBusinessActionState> {
  if (!businessId.trim()) {
    return { ok: false, message: "Business id is required." };
  }

  try {
    const business = await getCachedPublicBusiness(businessId.trim());
    return { ok: true, message: "ok", business };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not load business.",
    };
  }
}
