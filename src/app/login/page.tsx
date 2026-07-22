/**
 * /login page
 * -----------
 * Public page that renders the credentials login form.
 * If already signed in, bounce home (checked server-side).
 */
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/landing/Logo";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
        Sign in
      </h1>
      <LoginForm />
    </main>
  );
}
