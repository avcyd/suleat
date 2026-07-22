"use client";

/**
 * Header (CHANGED for auth)
 * -------------------------
 * - useSession() → know if someone is logged in
 * - Guest dropdown → Login / Register
 * - Signed-in dropdown → Account / Logout (signOut)
 */
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/data";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6 lg:px-8">
      <div
        className={`mx-auto flex max-w-[918px] items-center gap-3 rounded-full border border-black/8 bg-white px-7 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 sm:gap-4 sm:px-9 ${
          scrolled
            ? "border-black/10 bg-white/95 shadow-[0_10px_36px_rgba(0,0,0,0.14)] backdrop-blur-md"
            : ""
        }`}
      >
        <Logo size="sm" className="shrink-0 sm:text-[28px] lg:text-[32px]" />

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:w-[58%] sm:gap-3">
          <nav
            className="hidden shrink-0 items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-250 ${
                    isActive
                      ? "bg-ink text-white"
                      : "text-ink hover:bg-black/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <form
            className="relative hidden min-w-0 flex-1 sm:block"
            onSubmit={(event) => event.preventDefault()}
            role="search"
          >
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-full bg-search px-5 py-2.5 text-sm font-medium text-ink outline-none transition-colors placeholder:text-muted focus:bg-[#ececec] focus:ring-1 focus:ring-ink/10"
              aria-label="Search offers"
            />
          </form>

          <div
            ref={accountRef}
            className="relative"
            onMouseEnter={() => setAccountOpen(true)}
            onMouseLeave={() => setAccountOpen(false)}
          >
            <button
              type="button"
              className="flex size-8 shrink-0 items-center justify-center rounded-full transition-opacity duration-250 hover:opacity-75 sm:size-9"
              aria-label="Account menu"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => setAccountOpen((open) => !open)}
            >
              <Image
                src="/images/landing/profile.png"
                alt=""
                width={36}
                height={36}
                className="size-8 object-contain sm:size-9"
              />
            </button>

            <div
              role="menu"
              className={`absolute right-0 top-full z-50 min-w-[148px] origin-top-right pt-2 transition-all duration-200 ${
                accountOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              <div className="overflow-hidden rounded-2xl border border-black/5 bg-white py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.1)]">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-[#f5f5f5]"
                      onClick={() => setAccountOpen(false)}
                    >
                      Account
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-[#f5f5f5]"
                      onClick={() => {
                        setAccountOpen(false);
                        // Clears the NextAuth session cookie and redirects home.
                        void signOut({ callbackUrl: "/" });
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-[#f5f5f5]"
                      onClick={() => setAccountOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-[#f5f5f5]"
                      onClick={() => setAccountOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-ink flex size-9 items-center justify-center rounded-full md:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Menu</span>
            <span className="relative flex h-3.5 w-4 flex-col justify-between">
              <span
                className={`block h-0.5 w-4 origin-center bg-current transition-transform ${
                  menuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-4 bg-current transition-opacity ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-4 origin-center bg-current transition-transform ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mx-auto mt-2 max-w-[918px] rounded-3xl bg-nav p-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-full px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-black/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <form
            className="mt-3"
            onSubmit={(event) => event.preventDefault()}
            role="search"
          >
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-full bg-search px-5 py-3 text-sm font-medium text-ink outline-none placeholder:text-muted"
              aria-label="Search offers"
            />
          </form>
        </div>
      ) : null}
    </header>
  );
}
