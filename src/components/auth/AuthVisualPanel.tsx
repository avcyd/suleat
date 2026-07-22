import Image from "next/image";

/**
 * Left panel for login/register (from Figma).
 * Soft peach panel + decorative shapes up top + cafe illustration below.
 * No marketing copy — shapes fill the empty upper space instead.
 */
export function AuthVisualPanel() {
  return (
    <aside className="relative hidden min-h-[min(100vh,900px)] w-full overflow-hidden rounded-[30px] bg-merchant lg:flex lg:flex-col lg:justify-end lg:p-10 xl:p-12">
      {/* Decorative shapes — keep the upper area from looking empty */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <span className="absolute -left-10 -top-10 size-44 rounded-full bg-[#ffddcc]/55" />
        <span className="absolute left-28 top-16 size-24 rounded-full bg-brand/10" />
        <span className="absolute right-10 top-10 size-32 rounded-[2rem] bg-[#ffddcc]/70" />
        <span className="absolute right-28 top-40 size-14 rounded-full bg-brand/15" />
        <span className="absolute left-10 top-44 h-3 w-20 rounded-full bg-ink/10" />
        <span className="absolute left-16 top-52 h-3 w-12 rounded-full bg-brand/20" />
        <span className="absolute right-16 top-56 size-8 rotate-12 rounded-md bg-[#ffc9b0]/60" />
        <span className="absolute left-1/2 top-24 size-5 -translate-x-1/2 rounded-full bg-ink/8" />
      </div>

      <div className="relative z-10 mx-auto aspect-square w-full max-w-[480px]">
        <Image
          src="/images/auth/authvisual.svg"
          alt="People dining at a cafe"
          fill
          className="object-contain object-bottom"
          sizes="480px"
          priority
        />
      </div>
    </aside>
  );
}
