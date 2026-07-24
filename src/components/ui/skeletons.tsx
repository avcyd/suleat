/** Shared loading skeletons for route transitions and Suspense fallbacks. */

export function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-black/[0.06] ${className}`}
      aria-hidden
    />
  );
}

export function OfferCardSkeleton() {
  return (
    <div className="rounded-[10px] bg-offer-static p-3 sm:flex sm:gap-4">
      <SkeletonPulse className="mx-auto h-[168px] w-full max-w-[199px] rounded-[8px] sm:mx-0 sm:w-[199px]" />
      <div className="mt-3 flex min-w-0 flex-1 flex-col gap-2 sm:mt-0 sm:py-1">
        <SkeletonPulse className="h-7 w-3/4" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-5/6" />
        <SkeletonPulse className="mt-2 h-4 w-2/3" />
        <div className="mt-auto flex justify-between gap-3 pt-3">
          <SkeletonPulse className="h-4 w-28" />
          <SkeletonPulse className="h-8 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <main
      className="mx-auto flex w-full max-w-[914px] flex-col gap-8 px-4 pb-4 pt-5 sm:gap-10 sm:px-6 sm:pt-6 lg:gap-8"
      aria-busy="true"
      aria-label="Loading page"
    >
      <SkeletonPulse className="h-[220px] w-full rounded-[15px] sm:h-[280px]" />

      <div>
        <SkeletonPulse className="mb-4 h-8 w-40" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonPulse
              key={i}
              className="size-[90px] shrink-0 rounded-full sm:size-[107px]"
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <SkeletonPulse className="h-8 w-48" />
          <SkeletonPulse className="h-4 w-24" />
        </div>
        <div className="flex flex-col gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <OfferCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <SkeletonPulse className="h-40 w-full rounded-[20px]" />
    </main>
  );
}

export function OffersPageSkeleton() {
  return (
    <main
      className="mx-auto flex w-full max-w-[914px] flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 sm:pt-6"
      aria-busy="true"
      aria-label="Loading offers"
    >
      <SkeletonPulse className="h-[220px] w-full rounded-[15px] sm:h-[280px]" />
      <SkeletonPulse className="h-12 w-full rounded-full" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonPulse key={i} className="h-9 w-20 rounded-[10px]" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <OfferCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

export function LatestOffersSectionSkeleton() {
  return (
    <section
      className="mx-auto w-full max-w-[914px] px-4 sm:px-6"
      aria-busy="true"
      aria-label="Loading offers"
    >
      <div className="mb-4 flex items-end justify-between">
        <SkeletonPulse className="h-8 w-48" />
        <SkeletonPulse className="h-4 w-24" />
      </div>
      <div className="flex flex-col gap-1">
        {Array.from({ length: 3 }, (_, i) => (
          <OfferCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function MerchantCtaSkeleton() {
  return (
    <section className="mx-auto w-full max-w-[914px] px-4 sm:px-6">
      <SkeletonPulse className="h-40 w-full rounded-[20px]" />
    </section>
  );
}

export function AccountPageSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-[914px] px-4 py-8 sm:px-6"
      aria-busy="true"
      aria-label="Loading account"
    >
      <SkeletonPulse className="h-8 w-48" />
      <SkeletonPulse className="mt-2 h-4 w-64" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonPulse key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </main>
  );
}

export function AdminPanelSkeleton() {
  return (
    <div className="p-3" aria-busy="true" aria-label="Loading admin panel">
      <div className="flex flex-wrap items-center gap-2 border-b border-black/8 pb-3">
        <SkeletonPulse className="h-10 min-w-0 flex-1" />
        <SkeletonPulse className="h-10 w-28" />
        <SkeletonPulse className="h-10 w-20" />
      </div>
      <div className="mt-3 space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonPulse key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-black/8 pt-3">
        <SkeletonPulse className="h-4 w-40" />
        <SkeletonPulse className="h-8 w-36" />
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8"
      aria-busy="true"
      aria-label="Loading admin dashboard"
    >
      <header className="flex flex-col gap-3 border-b border-black/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SkeletonPulse className="h-3 w-28" />
          <SkeletonPulse className="mt-2 h-8 w-56" />
        </div>
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonPulse key={i} className="h-5 w-20" />
          ))}
        </div>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
        <div className="flex gap-1 overflow-hidden lg:flex-col">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonPulse key={i} className="h-10 w-28 lg:w-full" />
          ))}
        </div>
        <div className="min-w-0 rounded-xl border border-black/8 bg-white">
          <AdminPanelSkeleton />
        </div>
      </div>
    </main>
  );
}

export function MerchantDashboardSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8"
      aria-busy="true"
      aria-label="Loading merchant dashboard"
    >
      <SkeletonPulse className="h-8 w-64" />
      <SkeletonPulse className="mt-2 h-4 w-80" />
      <div className="mt-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonPulse key={i} className="h-10 w-28 shrink-0" />
        ))}
      </div>
      <div className="mt-5 space-y-3 rounded-xl border border-black/8 bg-white p-4">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonPulse key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </main>
  );
}

export function MerchantsPageSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6"
      aria-busy="true"
      aria-label="Loading merchants page"
    >
      <SkeletonPulse className="h-8 w-56" />
      <SkeletonPulse className="mt-2 h-4 w-full max-w-md" />
      <div className="mt-8 space-y-4 rounded-xl border border-black/8 bg-white p-5">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonPulse key={i} className="h-11 w-full" />
        ))}
        <SkeletonPulse className="mt-2 h-11 w-36" />
      </div>
    </main>
  );
}
