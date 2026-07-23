"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePostAction } from "@/actions/admin";
import { ConfirmDialog } from "@/components/merchant/ConfirmDialog";
import type { AdminPostDetail } from "@/types/admin";
import { DetailDrawer } from "./DetailDrawer";

type PostDetailDrawerProps = {
  post: AdminPostDetail | null;
  closeHref: string;
};

export function PostDetailDrawer({ post, closeHref }: PostDetailDrawerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function confirmDelete() {
    if (!post) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePostAction(post.id);
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
      <DetailDrawer open={!!post} title="Post details" closeHref={closeHref}>
        {post ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-muted">{post.dealLabel}</p>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={pending}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-deep hover:bg-brand/10 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
            {error ? (
              <p className="mt-2 text-xs text-brand-deep" role="alert">
                {error}
              </p>
            ) : null}
            <dl className="mt-4 grid gap-3">
              <Detail label="Caption" value={post.caption} />
              <Detail label="Type" value={post.promotionType} />
              <Detail label="Business" value={post.businessName} />
              <Detail label="Company" value={post.companyName} />
              <Detail label="Branch" value={post.branchLabel} />
              <Detail label="Created" value={post.createdAt} />
              <Detail label="Starts" value={post.startDate} />
              <Detail label="Ends" value={post.endDate} />
              <Detail label="Post ID" value={post.id} mono />
            </dl>
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Description
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">
                {post.description}
              </p>
            </div>
          </>
        ) : null}
      </DetailDrawer>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this post?"
        message="This permanently removes the promotion from the platform. This cannot be undone."
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
