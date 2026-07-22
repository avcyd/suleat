/**
 * (auth) layout — split screen from Figma Login/Register.
 * Left: peach panel + shapes + illustration
 * Right: form content from each page
 */
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="grid min-h-screen gap-6 p-3 lg:grid-cols-2 lg:gap-8 lg:p-3">
        <AuthVisualPanel />
        <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-10 xl:px-16">
          {children}
        </div>
      </div>
    </div>
  );
}
