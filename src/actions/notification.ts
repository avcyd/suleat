"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";

export type NotificationActionState = {
  ok: boolean;
  message: string;
};

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  try {
    await markNotificationRead(session.user.id, notificationId);
    revalidatePath("/");
    revalidatePath("/account");
    return { ok: true, message: "Notification dismissed." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not update notification.",
    };
  }
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  try {
    await markAllNotificationsRead(session.user.id);
    revalidatePath("/");
    revalidatePath("/account");
    return { ok: true, message: "Notifications cleared." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not update notifications.",
    };
  }
}
