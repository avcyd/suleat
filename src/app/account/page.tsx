/**
 * /account page (protected)
 * -------------------------
 * Example of gating a page with getSession() on the server.
 * Unauthenticated users are redirected to /login.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { getSession } from "@/lib/session";

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-page text-ink">
      <Header />
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

        <Link href="/" className="btn-primary mt-8 inline-flex">
          Back to home
        </Link>
      </main>
    </div>
  );
}
