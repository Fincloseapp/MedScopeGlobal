import type { Metadata } from "next";
import Link from "next/link";
import { MarketplaceTutorialPlayer } from "@/components/marketplace/marketplace-tutorial-player";
import { MarketplaceIntakeForm } from "@/components/marketplace/marketplace-intake-form";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMarketplaceUiCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.navodMetaTitle,
    description: copy.navodMetaDescription,
    path: "/exchange/navod",
    locale,
  });
}

export default async function ExchangeGuidePage() {
  const locale = await getServerLocale();
  const copy = getMarketplaceUiCopy(locale);
  const exchangeHref = localizePublicHref("/exchange", locale);
  const pausalHref = localizePublicHref("/inzerce/pausal", locale);

  return (
    <div className="bg-[#f4f7fa]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">{copy.navodKicker}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">{copy.navodTitle}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{copy.navodLead}</p>
        <div className="mt-8">
          <MarketplaceTutorialPlayer locale={locale} />
        </div>
        <ol className="mt-10 space-y-4">
          {copy.navodSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">
                {copy.navodStep} {index + 1}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-[#021d33]">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={exchangeHref} className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white">
            {copy.navodBack}
          </Link>
          <Link href={pausalHref} className="rounded-full border border-[#005B96] px-5 py-2.5 text-sm font-semibold text-[#005B96]">
            {copy.orderPausal}
          </Link>
        </div>
        <div className="mt-10">
          <MarketplaceIntakeForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
