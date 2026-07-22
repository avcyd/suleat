"use client";

/**
 * Login form styled to match Figma Login Page.
 */
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/layout";

const fieldClass =
  "w-full rounded-[10px] bg-search px-5 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-muted focus:ring-1 focus:ring-ink/15";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[377px]">
      <Logo size="sm" className="text-[20px]" />
      <h1 className="mt-8 font-display text-[32px] font-semibold leading-tight text-ink">
        Welcome back!
      </h1>
      <p className="mt-2 text-sm text-[#4b4b4b]">
        Enter your email and password to log in.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
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
            autoComplete="current-password"
            placeholder="***********"
            className={fieldClass}
          />
        </div>

        {error ? (
          <p className="text-sm font-medium text-brand" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="flex h-[43px] w-full items-center justify-center rounded-[10px] bg-ink text-sm font-medium text-white transition-all duration-250 hover:bg-[#1a2430] hover:shadow-[0_0_16px_2px_rgba(0,13,25,0.22)] disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-black">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand hover:text-brand-deep">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
