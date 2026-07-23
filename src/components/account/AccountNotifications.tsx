"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notification";

type AccountNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type AccountNotificationsProps = {
  notifications: AccountNotification[];
};

export function AccountNotifications({
  notifications,
}: AccountNotificationsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unreadCount = notifications.filter((item) => !item.read).length;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-ink">
          Notifications
        </h2>
        {unreadCount > 0 ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await markAllNotificationsReadAction();
                router.refresh();
              });
            }}
            className="text-sm font-medium text-brand-deep hover:underline disabled:opacity-60"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      <ul className="mt-3 space-y-2">
        {notifications.map((item) => (
          <li
            key={item.id}
            className={`rounded-[10px] px-4 py-3 ${
              item.read ? "bg-search/70" : "border border-brand/20 bg-[#fff0e7]"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#4b4b4b]">
                  {item.message}
                </p>
                <p className="mt-1 text-[11px] text-muted">{item.createdAt}</p>
              </div>
              {!item.read ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      await markNotificationReadAction(item.id);
                      router.refresh();
                    });
                  }}
                  className="shrink-0 text-xs font-medium text-brand-deep hover:underline disabled:opacity-60"
                >
                  Dismiss
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
