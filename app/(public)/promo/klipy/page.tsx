import type { Metadata } from "next";
import Link from "next/link";
import { PromoTeaserCard } from "@/components/ads/promo-teaser-card";
import { getPromoTeasers } from "@/lib/ads/promo-teasers";
import { getShareCopy } from "@/lib/i18n/share-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getShareCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: `${copy.clipsTitle} | ViaLongeVita`,
    description: copy.clipsLead,
    path: "/promo/klipy",
    locale,
  });
}

export default async function PromoKlipyPage() {
  const locale = await getServerLocale();
  const copy = getShareCopy(locale);
  const teasers = getPromoTeasers();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">{copy.clipsEyebrow}</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">{copy.clipsTitle}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{copy.clipsLead}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {teasers.map((teaser) => (
          <PromoTeaserCard key={teaser.id} teaser={teaser} locale={locale} />
        ))}
      </div>
      <nav className="mt-8 flex flex-wrap gap-3">
        <Link
          href={localizePublicHref("/predplatne#public", locale)}
          className="inline-flex rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004a7a]"
        >
          {copy.clipsSubscribe}
        </Link>
        <Link
          href={localizePublicHref("/firmy/reklama/nova", locale)}
          className="inline-flex rounded-full border border-[#005B96]/30 px-4 py-2 text-sm font-semibold text-[#005B96]"
        >
          {copy.clipsAds}
        </Link>
      </nav>
    </div>
  );
}
