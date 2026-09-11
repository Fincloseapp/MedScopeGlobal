import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExchangeOriginMark } from "@/components/exchange/origin-mark";
import { EXCHANGE_VISUAL } from "@/lib/brand/exchange-visuals";
import { categoryLabel } from "@/lib/exchange/categories";
import { AVAILABILITY_REGIONS, regionLabel } from "@/lib/exchange/regions";
import { filterDemoListings } from "@/lib/exchange/seed";
import type { ExchangeListing } from "@/lib/exchange/types";
import { getExchangeCopy, type ExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeMarketing } from "@/lib/i18n/exchange-marketing";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

/** Sync homepage strip — no data fetch, so it cannot stream below the magazine hero. */
export function ExchangeHomepageBillboard({ locale }: { locale: string }) {
  const copy = getExchangeCopy(locale);
  const marketing = getExchangeMarketing(locale);
  const items = filterDemoListings({}).slice(0, 2);
  const catalog = localizePublicHref("/exchange/catalog", locale);
  const home = localizePublicHref("/exchange", locale);

  return (
    <section className="relative overflow-hidden bg-[#021d33]">
      <img
        src={EXCHANGE_VISUAL.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#021d33] via-[#021d33]/82 to-[#021d33]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/70 via-transparent to-[#021d33]/20" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-16 lg:pt-20">
        <div className="max-w-xl">
          <ExchangeOriginMark locale={locale} tone="onDark" />
          <h2 className="mt-4 font-display text-[2.15rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-white/90 sm:text-lg sm:leading-8">{copy.lead}</p>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#e8d5a3]/90">{marketing.proof}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={home}
              className="inline-flex items-center rounded-full bg-[#c4a35a] px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-[#d4b56a]"
            >
              {marketing.ribbonCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href={catalog} className="text-sm font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline">
              {copy.catalogCta}
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/70">
            {AVAILABILITY_REGIONS.map((region, index) => (
              <span key={region}>
                {index > 0 ? <span className="mx-2 text-white/35">·</span> : null}
                <Link href={`${catalog}?regions=${region}`} className="hover:text-white">
                  {regionLabel(region, locale)}
                </Link>
              </span>
            ))}
          </p>
        </div>

        <div className="mt-10 grid max-w-xl gap-2.5">
          {items.map((listing) => (
            <FeaturedTeaser key={listing.id} listing={listing} locale={locale} copy={copy} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedTeaser({
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
    <Link
      href={href}
      className="group flex min-h-[4.75rem] items-center gap-3 rounded-xl bg-white/12 p-2 pr-3 ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/18"
    >
      {listing.imageUrl ? (
        <img src={listing.imageUrl} alt="" className="h-14 w-[4.5rem] shrink-0 rounded-lg object-cover" />
      ) : null}
      <span className="min-w-0">
        <span className="block text-xs font-medium text-[#e8d5a3]">
          {kindLabel} · {categoryLabel(listing.category, locale)}
        </span>
        <span className="mt-0.5 block truncate font-display text-sm font-semibold leading-snug text-white group-hover:text-[#f3e6c4]">
          {listing.title}
        </span>
      </span>
    </Link>
  );
}
