"use server";

/**
 * Menu Server Actions
 * -------------------
 * Session → FormData → Zod → menu service.
 * Menu items are scoped to a Business the merchant owns.
 */
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  createMenuItem,
  deleteMenuItemForUser,
  updateMenuItemForUser,
} from "@/services/menu.service";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "@/validators/menu";

export type MenuActionState = {
  ok: boolean;
  message: string;
};

function formFields(formData: FormData) {
  const description = String(formData.get("description") ?? "");
  const availableRaw = formData.get("isAvailable");

  return {
    itemName: String(formData.get("itemName") ?? ""),
    description,
    price: formData.get("price"),
    category: String(formData.get("category") ?? ""),
    isAvailable:
      availableRaw === "on" ||
      availableRaw === "true" ||
      availableRaw === "1",
  };
}

function refreshDashboard() {
  revalidatePath("/merchant/dashboard");
}

/** Create a menu item under a business. */
export async function createMenuItemAction(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  const parsed = createMenuItemSchema.safeParse({
    ...formFields(formData),
    businessId: String(formData.get("businessId") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await createMenuItem(session.user.id, parsed.data);
    refreshDashboard();
    return { ok: true, message: "Menu item created." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not create menu item.",
    };
  }
}

/** Update a menu item owned via the merchant's business. */
export async function updateMenuItemAction(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  const menuItemId = String(formData.get("menuItemId") ?? "").trim();
  if (!menuItemId) {
    return { ok: false, message: "Menu item id is required." };
  }

  const parsed = updateMenuItemSchema.safeParse(formFields(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await updateMenuItemForUser(session.user.id, menuItemId, parsed.data);
    refreshDashboard();
    return { ok: true, message: "Menu item updated." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not update menu item.",
    };
  }
}

/** Delete a menu item owned via the merchant's business. */
export async function deleteMenuItemAction(
  menuItemId: string,
): Promise<MenuActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  if (!menuItemId.trim()) {
    return { ok: false, message: "Menu item id is required." };
  }

  try {
    await deleteMenuItemForUser(session.user.id, menuItemId);
    refreshDashboard();
    return { ok: true, message: "Menu item deleted." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not delete menu item.",
    };
  }
}
