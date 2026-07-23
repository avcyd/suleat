"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type DetailDrawerProps = {
  open: boolean;
  title: string;
  /** URL without the detail id param (keeps tab/q/page/sort). */
  closeHref: string;
  /** Stack above other drawers when nested (e.g. business over company). */
  elevate?: boolean;
  children: React.ReactNode;
};

export function DetailDrawer({
  open,
  title,
  closeHref,
  elevate = false,
  children,
}: DetailDrawerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.replace(closeHref);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeHref, router]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 flex justify-end ${
        elevate ? "z-[90]" : "z-[80]"
      }`}
    >
      <button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 bg-ink/40"
        onClick={() => router.replace(closeHref)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.12)]"
      >
        <header className="flex items-center justify-between border-b border-black/8 px-4 py-3">
          <h2
            id="admin-drawer-title"
            className="text-sm font-semibold text-ink"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={() => router.replace(closeHref)}
            className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-black/[0.04]"
          >
            Close
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}
