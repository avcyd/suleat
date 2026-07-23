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
