import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangeCatalogFilters } from "@/components/exchange/catalog-filters";
import { ExchangeListingCard } from "@/components/exchange/listing-card";
import { listExchangeAds, listExchangeListings } from "@/lib/exchange/catalog";
import { parseAvailabilityRegions } from "@/lib/exchange/regions";
import type { ListingKind } from "@/lib/exchange/types";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: copy.catalogMetaTitle,
    description: copy.catalogMetaDescription,
    path: "/exchange/catalog",
    locale,
  });
}

export default async function ExchangeCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const kind = typeof params.kind === "string" ? params.kind : "any";
  const category = typeof params.category === "string" ? params.category : "";
  const regions = parseAvailabilityRegions(
    typeof params.regions === "string" ? params.regions.split(",") : []
  );
  const { items, source } = await listExchangeListings({
    q,
    kind: kind as ListingKind | "any",
    category: category || undefined,
    regions,
    locale,
  });
  const ads = await listExchangeAds(regions);
  const path = localizePublicHref("/exchange/catalog", locale);

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.catalogTitle} description={copy.catalogLead}>
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href={localizePublicHref("/exchange/onboard", locale)}
          className="rounded-full bg-[#021d33] px-5 py-2 text-sm font-semibold text-white hover:bg-[#032844]"
        >
          {copy.onboardCta}
        </Link>
        <Link
          href={localizePublicHref("/exchange", locale)}
          className="rounded-full border border-[#c4a35a] px-5 py-2 text-sm font-semibold text-[#021d33]"
        >
          {copy.eyebrow}
        </Link>
      </div>
      <ExchangeCatalogFilters
        locale={locale}
        copy={copy}
        q={q}
        kind={kind}
        category={category}
        regions={regions}
        path={path}
      />
      {ads[0] ? (
        <aside className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">Sponsored</p>
          <p className="mt-1 font-semibold text-[#021d33]">{ads[0].title}</p>
          <p className="text-slate-600">{ads[0].body}</p>
        </aside>
      ) : null}
      {source === "demo" ? <p className="mt-4 text-xs text-slate-500">{copy.demoNote}</p> : null}
      {items.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">{copy.empty}</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((listing) => (
            <ExchangeListingCard key={listing.id} listing={listing} locale={locale} copy={copy} />
          ))}
        </div>
      )}
    </ModulePageShell>
  );
}
