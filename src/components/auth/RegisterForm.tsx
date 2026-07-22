"use client";

/**
 * Register form styled to match Figma Register Page.
 */
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { registerUser, type AuthActionState } from "@/actions/auth";
import { Logo } from "@/components/layout";

const initialState: AuthActionState = {
  ok: false,
  message: "",
};

const fieldClass =
  "w-full rounded-[10px] bg-search px-5 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-muted focus:ring-1 focus:ring-ink/15";

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerUser, initialState);
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
    <div className="mx-auto w-full max-w-[377px]">
      <Logo size="sm" className="text-[20px]" />
      <h1 className="mt-6 font-display text-[32px] font-semibold leading-tight text-ink">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-[#4b4b4b]">
        To continue, fill out the details.
      </p>

      <form
        action={(formData) => {
          setCredentials({
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          });
          formAction(formData);
        }}
        className="mt-7 flex flex-col gap-4"
      >
        <div>
          <label
            htmlFor="displayName"
            className="mb-2 block text-base font-medium text-ink"
          >
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            autoComplete="name"
            placeholder="John Doe"
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-base font-medium text-ink"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="john.doe@example.com"
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-base font-medium text-ink"
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
            placeholder="***********"
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-base font-medium text-ink"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="***********"
            className={fieldClass}
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

        <button
          type="submit"
          disabled={pending}
          className="mt-1 flex h-[43px] w-full items-center justify-center rounded-[10px] bg-ink text-sm font-medium text-white transition-all duration-250 hover:bg-[#1a2430] hover:shadow-[0_0_16px_2px_rgba(0,13,25,0.22)] disabled:opacity-60"
        >
          {pending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-black">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:text-brand-deep">
          Sign In
        </Link>
      </p>
    </div>
  );
}
