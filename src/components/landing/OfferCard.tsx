import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@/types/landing";

type OfferCardProps = {
  offer: Offer;
};

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[10px] bg-offer-static transition-colors duration-500 ease-out hover:bg-offer-hover">
      <Link
        href={offer.href}
        className="flex flex-col gap-3 p-3 sm:flex-row sm:items-stretch sm:gap-4"
      >
        <div className="relative mx-auto h-[168px] w-full max-w-[199px] shrink-0 overflow-hidden rounded-[8px] sm:mx-0 sm:w-[199px]">
          <Image
            src={offer.image}
            alt={offer.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="199px"
          />
          <span className="absolute bottom-2 right-2 rounded-[5px] border border-brand bg-[#fff0e7] px-2.5 py-1 text-xs font-light text-brand-deep">
            {offer.discountLabel}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col py-1">
          <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            {offer.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#363636]">
            {offer.description}{" "}
            <span className="text-brand transition-colors group-hover:text-brand-deep">
              See More
            </span>
          </p>
          <p className="mt-2 line-clamp-1 text-sm italic font-light text-[#797979]">
            {offer.address}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
            <span className="text-sm font-semibold text-brand">
              {offer.merchant}
            </span>
            <span className="rounded-full border border-red-500 bg-[#ffe3e3] px-4 py-1.5 text-xs italic font-light text-red-500">
              Expires at {offer.expiresAt}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
