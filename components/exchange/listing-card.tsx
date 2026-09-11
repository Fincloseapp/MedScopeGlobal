import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ExchangeListing } from "@/lib/exchange/types";
import { categoryLabel } from "@/lib/exchange/categories";
import { regionLabel } from "@/lib/exchange/regions";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import type { ExchangeCopy } from "@/lib/i18n/exchange-copy";
import { cn } from "@/lib/utils";

export function ExchangeListingCard({
  listing,
  locale,
  copy,
  compact = false,
  dark = false,
}: {
  listing: ExchangeListing;
  locale: string;
  copy: ExchangeCopy;
  compact?: boolean;
  dark?: boolean;
}) {
  const href = localizePublicHref(`/exchange/listing/${listing.slug}`, locale);
  const kindLabel =
    listing.kind === "product" ? copy.kindProduct : listing.kind === "service" ? copy.kindService : copy.kindDemand;
  return (
    <article
      className={cn(
        "flex h-full flex-col border p-5 shadow-sm transition hover:-translate-y-0.5",
        compact ? "rounded-xl p-4" : "rounded-2xl",
        dark
          ? "border-white/10 bg-white/[0.06] text-white shadow-none"
          : "border-[#cfe1f3] bg-white"
      )}
    >
      {listing.imageUrl ? (
        <div className={cn("relative mb-3 overflow-hidden", compact ? "h-28 rounded-lg" : "h-40 rounded-xl")}>
          <img src={listing.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]",
          dark ? "text-[#e8d5a3]" : "text-[#005B96]"
        )}
      >
        <span>{kindLabel}</span>
        <span aria-hidden>·</span>
        <span>{categoryLabel(listing.category, locale)}</span>
        {listing.featured ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5",
              dark ? "bg-[#c4a35a] text-[#021d33]" : "bg-[#005B96]/10 text-[#005B96]"
            )}
          >
            Featured
          </span>
        ) : null}
      </div>
      <h3 className={cn("mt-3 font-display font-semibold", compact ? "text-base" : "text-lg", dark ? "text-white" : "text-[#021d33]")}>
        <Link href={href} className="hover:underline">
          {listing.title}
        </Link>
      </h3>
      <p className={cn("mt-2 flex-1 leading-6", compact ? "line-clamp-2 text-sm" : "text-sm", dark ? "text-slate-300" : "text-slate-600")}>
        {listing.summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {listing.availabilityRegions.map((region) => (
          <span
            key={region}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              dark ? "border border-white/20 text-slate-200" : "border border-[#cfe1f3] text-slate-700"
            )}
          >
            {regionLabel(region, locale)}
          </span>
        ))}
        {listing.certifications.map((code) => (
          <span
            key={code}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              dark ? "bg-white/10 text-slate-100" : "bg-slate-100 text-slate-700"
            )}
          >
            {code}
          </span>
        ))}
      </div>
      {listing.organization ? (
        <p className={cn("mt-3 text-xs", dark ? "text-slate-400" : "text-slate-500")}>
          {listing.organization.tradeName}
          {listing.organization.verified ? ` · ${copy.verified}` : ""}
        </p>
      ) : null}
      <Link
        href={href}
        className={cn(
          "mt-4 inline-flex items-center text-sm font-semibold",
          dark ? "text-[#e8d5a3] hover:text-white" : "text-[#005B96] hover:underline"
        )}
      >
        {copy.contactCta}
        <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
      </Link>
    </article>
  );
}
