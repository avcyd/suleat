"use client";

import { useMemo, useState } from "react";
import type {
  BusinessProfile,
  MenuItem,
  MerchantAccount,
  PromotionPost,
} from "@/types/merchant";
import { AccountPanel } from "./AccountPanel";
import { BusinessesPanel } from "./BusinessesPanel";
import { MenuPanel } from "./MenuPanel";
import { PromotionsPanel } from "./PromotionsPanel";

type TabId = "businesses" | "menu" | "promotions" | "account";

const tabs: { id: TabId; label: string }[] = [
  { id: "businesses", label: "Businesses" },
  { id: "menu", label: "Menu" },
  { id: "promotions", label: "Promotions" },
  { id: "account", label: "Account" },
];

type MerchantDashboardProps = {
  account: MerchantAccount;
  businesses: BusinessProfile[];
  menuItems: MenuItem[];
};

/**
 * Merchant Business Dashboard
 * ---------------------------
 * Account / businesses / menu are backed by server data + actions.
 * Promotions remain local mock until that domain is wired.
 */
export function MerchantDashboard({
  account,
  businesses,
  menuItems,
}: MerchantDashboardProps) {
  const [tab, setTab] = useState<TabId>("businesses");
  const [promotions, setPromotions] = useState<PromotionPost[]>([]);

  const stats = useMemo(
    () => ({
      businesses: businesses.length,
      menuItems: menuItems.length,
      activePromos: promotions.filter((promo) => promo.status === "active")
        .length,
      archivedPromos: promotions.filter((promo) => promo.status === "archived")
        .length,
    }),
    [businesses, menuItems, promotions],
  );

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="rounded-[24px] bg-merchant px-5 py-6 sm:px-8 sm:py-8">
        <p className="text-sm font-semibold tracking-[0.16em] text-brand-deep">
          MERCHANT DASHBOARD
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Business Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#4b4b4b]">
          Manage profiles, menus, promotions, and account settings for{" "}
          <span className="font-semibold text-ink">{account.companyName}</span>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <StatChip label="Businesses" value={stats.businesses} />
          <StatChip label="Menu items" value={stats.menuItems} />
          <StatChip label="Active posts" value={stats.activePromos} />
          <StatChip label="Archived" value={stats.archivedPromos} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-black/5 pb-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              tab === item.id
                ? "bg-ink text-white"
                : "bg-search text-ink hover:bg-[#e8e8e8]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "businesses" ? (
          <BusinessesPanel businesses={businesses} />
        ) : null}

        {tab === "menu" ? (
          <MenuPanel businesses={businesses} menuItems={menuItems} />
        ) : null}

        {tab === "promotions" ? (
          <PromotionsPanel
            businesses={businesses}
            promotions={promotions}
            onCreate={(payload) => {
              const next: PromotionPost = {
                ...payload,
                id: `promo-${Math.random().toString(36).slice(2, 9)}`,
                status: "active",
                createdAt: new Date().toISOString().slice(0, 10),
              };
              setPromotions((prev) => [next, ...prev]);
            }}
            onUpdate={(updated) => {
              setPromotions((prev) =>
                prev.map((promo) =>
                  promo.id === updated.id ? updated : promo,
                ),
              );
            }}
            onDelete={(id) => {
              setPromotions((prev) => prev.filter((promo) => promo.id !== id));
            }}
            onArchive={(id) => {
              setPromotions((prev) =>
                prev.map((promo) =>
                  promo.id === id ? { ...promo, status: "archived" } : promo,
                ),
              );
            }}
          />
        ) : null}

        {tab === "account" ? <AccountPanel account={account} /> : null}
      </div>
    </main>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-full bg-white/80 px-4 py-2 text-sm shadow-sm">
      <span className="font-semibold text-ink">{value}</span>{" "}
      <span className="text-[#555]">{label}</span>
    </div>
  );
}
