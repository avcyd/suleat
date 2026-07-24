"use client";

/**
 * Instant feedback for admin URL navigations (tabs, search, pagination, drawers).
 * Same-route searchParam changes do not show loading.tsx — this fills that gap.
 */
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AdminPanelSkeleton } from "@/components/ui/skeletons";
import { adminDashboardHref } from "@/lib/admin-href";
import type { AdminCounts, AdminTab } from "@/types/admin";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "requests", label: "Requests" },
  { id: "users", label: "Users" },
  { id: "companies", label: "Companies" },
  { id: "posts", label: "Posts" },
];

type AdminDashboardChromeProps = {
  tab: AdminTab;
  counts: AdminCounts;
  panel: ReactNode;
  drawers: ReactNode;
};

function isAdminDashboardUrl(url: URL) {
  return url.pathname === "/admin/dashboard";
}

function parseTabParam(raw: string | null): AdminTab | null {
  if (
    raw === "companies" ||
    raw === "posts" ||
    raw === "users" ||
    raw === "requests"
  ) {
    return raw;
  }
  return null;
}

export function AdminDashboardChrome({
  tab,
  counts,
  panel,
  drawers,
}: AdminDashboardChromeProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticTab, setOptimisticTab] = useState<AdminTab | null>(null);

  useEffect(() => {
    if (!pending) setOptimisticTab(null);
  }, [pending, tab]);

  const displayTab = optimisticTab ?? tab;

  const navigate = useCallback((href: string, nextTab?: AdminTab | null) => {
    if (nextTab) setOptimisticTab(nextTab);
    startTransition(() => {
      router.push(href);
    });
  }, [router]);

  const onClickCapture = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!isAdminDashboardUrl(url)) return;

      event.preventDefault();
      navigate(
        `${url.pathname}${url.search}`,
        parseTabParam(url.searchParams.get("tab")),
      );
    },
    [navigate],
  );

  const onSubmitCapture = useCallback(
    (event: FormEvent<HTMLElement>) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      const method = (form.getAttribute("method") || "get").toLowerCase();
      if (method !== "get") return;

      const action = form.getAttribute("action") || window.location.pathname;
      let url: URL;
      try {
        url = new URL(action, window.location.origin);
      } catch {
        return;
      }
      if (!isAdminDashboardUrl(url)) return;

      event.preventDefault();
      const params = new URLSearchParams();
      const data = new FormData(form);
      for (const [key, value] of data.entries()) {
        if (typeof value !== "string") continue;
        if (!value && key !== "q") continue;
        params.set(key, value);
      }
      const qs = params.toString();
      navigate(
        qs ? `${url.pathname}?${qs}` : url.pathname,
        parseTabParam(params.get("tab")),
      );
    },
    [navigate],
  );

  return (
    <main
      className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8"
      onClickCapture={onClickCapture}
      onSubmitCapture={onSubmitCapture}
      aria-busy={pending}
    >
      <header className="flex flex-col gap-3 border-b border-black/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-deep">
            Administrator
          </p>
          <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            Platform Dashboard
          </h1>
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Requests</dt>
            <dd className="font-semibold text-ink">{counts.pendingRequests}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Users</dt>
            <dd className="font-semibold text-ink">{counts.users}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Companies</dt>
            <dd className="font-semibold text-ink">{counts.companies}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Posts</dt>
            <dd className="font-semibold text-ink">{counts.posts}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav
          aria-label="Admin sections"
          className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {tabs.map((item) => {
            const active = displayTab === item.id;
            const label =
              item.id === "requests" && counts.pendingRequests > 0
                ? `Requests (${counts.pendingRequests})`
                : item.label;
            return (
              <a
                key={item.id}
                href={adminDashboardHref({ tab: item.id, page: "1" })}
                className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-white"
                    : "text-[#444] hover:bg-black/[0.04]"
                } ${pending && !active ? "opacity-70" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </a>
            );
          })}
        </nav>

        <div className="min-w-0 rounded-xl border border-black/8 bg-white">
          {pending ? <AdminPanelSkeleton /> : panel}
        </div>
      </div>

      {pending ? null : drawers}
    </main>
  );
}
