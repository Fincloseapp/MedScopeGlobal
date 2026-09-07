import Link from "next/link";
import { PromoTeaserCard } from "@/components/ads/promo-teaser-card";
import { EditorialPayButtons } from "@/components/subscription/editorial-pay-buttons";
import { getPromoTeasers } from "@/lib/ads/promo-teasers";
import { getShareCopy } from "@/lib/i18n/share-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function HomepagePromoTeasers({ locale }: { locale: string }) {
  const copy = getShareCopy(locale);
  const teasers = getPromoTeasers(locale);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-2 sm:px-6" aria-labelledby="homepage-promo-title">
      <div className="rounded-xl border border-[#d7e6f4] bg-white px-5 py-6 sm:px-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">{copy.clipsEyebrow}</p>
        <h2 id="homepage-promo-title" className="mt-1 font-display text-2xl font-semibold text-[#021d33]">
          {copy.clipsTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{copy.clipsLead}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {teasers.map((teaser, index) => (
            <PromoTeaserCard key={teaser.id} teaser={teaser} locale={locale} autoPlay={index === 0} />
          ))}
        </div>
        <div className="mt-5">
          <EditorialPayButtons locale={locale} className="flex max-w-xl flex-col gap-2 sm:flex-row" />
        </div>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label={copy.clipsTitle}>
          <Link
            href={localizePublicHref("/predplatne#public", locale)}
            className="inline-flex items-center rounded-full bg-[#005B96] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            {copy.clipsSubscribe}
          </Link>
          <Link
            href={localizePublicHref("/firmy/reklama/nova", locale)}
            className="inline-flex items-center rounded-full border border-[#005B96]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#005B96] hover:bg-[#005B96]/5"
          >
            {copy.clipsAds}
          </Link>
          <Link
            href={localizePublicHref("/promo/klipy", locale)}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            {copy.clipsLibrary}
          </Link>
        </nav>
      </div>
    </section>
  );
}
