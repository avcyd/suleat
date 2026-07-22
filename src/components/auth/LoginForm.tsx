"use client";

/**
 * Login form (client)
 * -------------------
 * Uses next-auth's signIn("credentials") which POSTs to /api/auth/[...nextauth].
 * We keep this on the client because signIn manages cookies/CSRF for us.
 */
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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

    // redirect: false → we handle success/error in this component.
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
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-md flex-col gap-4">
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
          autoComplete="current-password"
          className="w-full rounded-full bg-search px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-brand" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-[#363636]">
        No account yet?{" "}
        <Link href="/register" className="font-semibold text-brand hover:text-brand-deep">
          Create one
        </Link>
      </p>
    </form>
  );
}
