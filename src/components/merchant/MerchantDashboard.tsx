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
  promotions: PromotionPost[];
};

/**
 * Merchant Business Dashboard — compact workspace layout.
 */
export function MerchantDashboard({
  account,
  businesses,
  menuItems,
  promotions,
}: MerchantDashboardProps) {
  const [tab, setTab] = useState<TabId>("businesses");

  const stats = useMemo(
    () => ({
      businesses: businesses.length,
      menuItems: menuItems.length,
      activePromos: promotions.filter((promo) => promo.status === "active")
        .length,
    }),
    [businesses, menuItems, promotions],
  );

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
      {/* Compact top bar */}
      <header className="flex flex-col gap-3 border-b border-black/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-deep">
            Merchant
          </p>
          <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            {account.companyName}
          </h1>
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Businesses</dt>
            <dd className="font-semibold text-ink">{stats.businesses}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Menu</dt>
            <dd className="font-semibold text-ink">{stats.menuItems}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Active promos</dt>
            <dd className="font-semibold text-ink">{stats.activePromos}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
        {/* Side nav */}
        <nav
          aria-label="Dashboard sections"
          className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-white"
                    : "text-[#444] hover:bg-black/[0.04]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Workspace */}
        <div className="min-w-0 rounded-xl border border-black/8 bg-white">
          {tab === "businesses" ? (
            <BusinessesPanel businesses={businesses} />
          ) : null}

          {tab === "menu" ? (
            <MenuPanel businesses={businesses} menuItems={menuItems} />
          ) : null}

          {tab === "promotions" ? (
            <PromotionsPanel
              businesses={businesses}
              menuItems={menuItems}
              promotions={promotions}
            />
          ) : null}

          {tab === "account" ? <AccountPanel account={account} /> : null}
        </div>
      </div>
    </main>
  );
}
