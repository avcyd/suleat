/**
 * /account page (protected)
 * -------------------------
 * Navbar/Footer come from (site)/layout.tsx — no need to import them here.
 * Unauthenticated users are redirected by proxy.ts + this getSession check.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-[914px] px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Account</h1>
      <p className="mt-2 text-sm text-[#363636]">
        Signed in as <span className="font-semibold">{session.user.email}</span>
      </p>

      <dl className="mt-8 space-y-4 rounded-[10px] bg-offer-static p-6">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Display name
          </dt>
          <dd className="mt-1 text-base font-medium">
            {session.user.name ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Role
          </dt>
          <dd className="mt-1 text-base font-medium">{session.user.role}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        {session.user.role === "MERCHANT" ? (
          <Link href="/merchant/dashboard" className="btn-primary inline-flex">
            Merchant Dashboard
          </Link>
        ) : null}
        <Link
          href="/"
          className="inline-flex h-[43px] items-center rounded-full border border-ink/15 px-6 text-sm font-medium text-ink hover:bg-black/5"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
