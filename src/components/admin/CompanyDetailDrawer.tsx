"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCompanyAction } from "@/actions/admin";
import { ConfirmDialog } from "@/components/merchant/ConfirmDialog";
import { adminDashboardHref } from "@/lib/admin-href";
import type { AdminCompanyDetail } from "@/types/admin";
import { DetailDrawer } from "./DetailDrawer";

type CompanyDetailDrawerProps = {
  company: AdminCompanyDetail | null;
  closeHref: string;
  listParams: Record<string, string | undefined>;
};

export function CompanyDetailDrawer({
  company,
  closeHref,
  listParams,
}: CompanyDetailDrawerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function confirmDelete() {
    if (!company) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCompanyAction(company.id);
      if (!result.ok) {
        setError(result.message);
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      router.replace(closeHref);
      startTransition(() => {
        router.refresh();
      });
    });
  }

  return (
    <>
      <DetailDrawer
        open={!!company}
        title="Company details"
        closeHref={closeHref}
      >
        {company ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-muted">
                {company.businessCount} business
                {company.businessCount === 1 ? "" : "es"}
              </p>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={pending}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-deep hover:bg-brand/10 disabled:opacity-60"
              >
                Delete company
              </button>
            </div>

            {error ? (
              <p className="mt-2 text-xs text-brand-deep" role="alert">
                {error}
              </p>
            ) : null}

            <dl className="mt-4 grid gap-3">
              <Detail label="Company name" value={company.companyName} />
              <Detail label="Phone" value={company.phoneNumber} />
              <Detail label="Tax ID" value={company.taxId} />
              <Detail
                label="Verified"
                value={company.verificationStatus ? "Yes" : "No"}
              />
              <Detail label="Owner" value={company.ownerName} />
              <Detail label="Owner email" value={company.ownerEmail} />
              <Detail label="Company ID" value={company.id} mono />
              <Detail label="Owner user ID" value={company.ownerUserId} mono />
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-ink">
                Businesses ({company.businessCount})
              </h3>
              {company.businesses.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No businesses yet.</p>
              ) : (
                <>
                  <ul className="mt-3 space-y-2">
                    {company.businesses.map((business) => (
                      <li key={business.id}>
                        <Link
                          href={adminDashboardHref({
                            ...listParams,
                            companyId: company.id,
                            businessId: business.id,
                          })}
                          className="block rounded-lg bg-search/80 px-3 py-2.5 transition-colors hover:bg-search"
                        >
                          <p className="text-sm font-medium text-ink">
                            {business.businessName}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                            {business.description}
                          </p>
                          <p className="mt-1.5 text-[11px] text-muted">
                            Est. {business.dateEstablishment} ·{" "}
                            {business.branchCount} branches ·{" "}
                            {business.menuCount} menu ·{" "}
                            {business.promotionCount} posts
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-brand-deep">
                            View details →
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {company.businessCount > company.businesses.length ? (
                    <p className="mt-2 text-xs text-muted">
                      Showing first {company.businesses.length} of{" "}
                      {company.businessCount}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </>
        ) : null}
      </DetailDrawer>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this company?"
        message={
          company
            ? `This permanently removes “${company.companyName}”, its businesses, menus, and posts. The owner’s merchant role will be revoked. This cannot be undone.`
            : ""
        }
        confirmLabel={pending ? "Deleting…" : "Delete"}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd
        className={`mt-0.5 break-all text-sm text-ink ${
          mono ? "font-mono text-xs" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
