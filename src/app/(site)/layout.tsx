/**
 * (site) layout
 * -------------
 * Applies global Navbar + Footer to all pages in this route group
 * (home, account, future main app pages). URLs stay the same — `(site)`
 * is a folder-only group and does not appear in the path.
 *
 * Auth pages live under `(auth)` so they skip this chrome.
 */
import { Footer, Navbar } from "@/components/layout";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-page text-ink">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
