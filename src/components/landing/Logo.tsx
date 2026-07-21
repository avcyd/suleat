import Link from "next/link";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "text-2xl",
  md: "text-[32px]",
  lg: "text-4xl",
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`font-display font-semibold italic leading-none tracking-tight transition-opacity hover:opacity-80 ${sizeClass[size]} ${className}`}
      aria-label="Suleat home"
    >
      <span className="text-ink">Sul</span>
      <span className="text-brand-deep">eat!</span>
    </Link>
  );
}
