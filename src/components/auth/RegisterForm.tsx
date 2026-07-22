"use client";

/**
 * Register form (client)
 * ----------------------
 * Submits to the `registerUser` Server Action (src/actions/auth.ts).
 * On success, auto-signs in via NextAuth credentials so the user lands logged in.
 */
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { registerUser, type AuthActionState } from "@/actions/auth";

const initialState: AuthActionState = {
  ok: false,
  message: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerUser, initialState);

  // Keep a copy of credentials so we can call signIn after the Server Action succeeds.
  // (FormData is not available anymore once the action finishes.)
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  useEffect(() => {
    async function loginAfterRegister() {
      if (!state.ok || !credentials.email || !credentials.password) return;

      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    }

    void loginAfterRegister();
  }, [state.ok, credentials, router]);

  return (
    <form
      action={(formData) => {
        setCredentials({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        });
        formAction(formData);
      }}
      className="mx-auto flex w-full max-w-md flex-col gap-4"
    >
      <div>
        <label
          htmlFor="displayName"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-full bg-search px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-full bg-search px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-full bg-search px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-full bg-search px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
        />
      </div>

      {state.message ? (
        <p
          className={`text-sm font-medium ${state.ok ? "text-green-700" : "text-brand"}`}
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-[#363636]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:text-brand-deep">
          Sign in
        </Link>
      </p>
    </form>
  );
}
