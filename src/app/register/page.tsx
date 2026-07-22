/**
 * /register page
 * --------------
 * Public page for creating a new account via the register Server Action.
 */
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Logo } from "@/components/landing/Logo";
import { getSession } from "@/lib/session";

export default async function RegisterPage() {
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
        Create account
      </h1>
      <RegisterForm />
    </main>
  );
}
