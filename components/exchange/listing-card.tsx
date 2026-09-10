import Link from "next/link";
import type { ExchangeListing } from "@/lib/exchange/types";
import { categoryLabel } from "@/lib/exchange/categories";
import { regionLabel } from "@/lib/exchange/regions";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import type { ExchangeCopy } from "@/lib/i18n/exchange-copy";

export function ExchangeListingCard({
  listing,
  locale,
  copy,
}: {
  listing: ExchangeListing;
  locale: string;
  copy: ExchangeCopy;
}) {
  const href = localizePublicHref(`/exchange/listing/${listing.slug}`, locale);
  const kindLabel =
    listing.kind === "product" ? copy.kindProduct : listing.kind === "service" ? copy.kindService : copy.kindDemand;
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
        <span>{kindLabel}</span>
        <span aria-hidden>·</span>
        <span>{categoryLabel(listing.category, locale)}</span>
        {listing.featured ? (
          <span className="rounded-full bg-[#005B96]/10 px-2 py-0.5 text-[#005B96]">Featured</span>
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-[#021d33]">
        <Link href={href} className="hover:underline">
          {listing.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{listing.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {listing.availabilityRegions.map((region) => (
          <span key={region} className="rounded-full border border-[#cfe1f3] px-2.5 py-0.5 text-xs text-slate-700">
            {regionLabel(region, locale)}
          </span>
        ))}
        {listing.certifications.map((code) => (
          <span key={code} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {code}
          </span>
        ))}
      </div>
      {listing.organization ? (
        <p className="mt-3 text-xs text-slate-500">
          {listing.organization.tradeName}
          {listing.organization.verified ? ` · ${copy.verified}` : ""}
        </p>
      ) : null}
      <Link href={href} className="mt-4 text-sm font-semibold text-[#005B96] hover:underline">
        {copy.contactCta} →
      </Link>
    </article>
  );
}
