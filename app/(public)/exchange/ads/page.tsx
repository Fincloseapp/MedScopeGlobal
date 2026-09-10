import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { listExchangeAds } from "@/lib/exchange/catalog";
import { EXCHANGE_AD_PACKAGES } from "@/lib/exchange/monetization";
import { regionLabel } from "@/lib/exchange/regions";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { getServerLocale, getServerRegion } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: copy.adsMetaTitle,
    description: copy.adsLead,
    path: "/exchange/ads",
    locale,
  });
}

export default async function ExchangeAdsPage() {
  const locale = await getServerLocale();
  const region = await getServerRegion();
  const copy = getExchangeCopy(locale);
  const ads = await listExchangeAds();

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.adsTitle} description={copy.adsLead}>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(EXCHANGE_AD_PACKAGES).map((pack) => (
          <article key={pack.id} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <h2 className="font-display text-lg font-semibold capitalize">{pack.id.replace("_", " ")}</h2>
            <p className="mt-2 text-xl font-bold text-[#005B96]">{formatCzkListPrice(pack.monthlyCzk, locale, region)}</p>
          </article>
        ))}
      </div>
      <ul className="mt-8 space-y-3">
        {ads.map((ad) => (
          <li key={ad.id} className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">{ad.format}</p>
            <h3 className="mt-1 font-semibold">{ad.title}</h3>
            <p className="text-sm text-slate-600">{ad.body}</p>
            <p className="mt-2 text-xs text-slate-500">
              {ad.availabilityRegions.map((item) => regionLabel(item, locale)).join(" · ")} · {ad.impressions}{" "}
              impressions · {ad.clicks} clicks
            </p>
          </li>
        ))}
      </ul>
      <Link
        href={localizePublicHref("/inzerce/formular", locale)}
        className="mt-8 inline-block rounded-full bg-[#005B96] px-5 py-2 text-sm font-semibold text-white"
      >
        {copy.onboardCta}
      </Link>
    </ModulePageShell>
  );
}
