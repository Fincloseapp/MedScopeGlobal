import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangeAboutMarketplace } from "@/components/exchange/about-marketplace";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).about;
  return await buildLocalizedPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/o-nas",
    locale,
  });
}

export default async function ONasPage() {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).about;

  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.lead}
      ctaHref={localizePublicHref("/exchange", locale)}
      ctaLabel={copy.marketplaceCta}
      homeHref={localizePublicHref("/", locale)}
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={localizePublicHref("/", locale)} className="hover:text-foreground">
          {copy.home}
        </Link>
        <span className="mx-2">/</span>
        <span>{copy.eyebrow}</span>
      </nav>

      <PublicTrustDisclaimer className="mb-8" />

      <ExchangeAboutMarketplace locale={locale} />

      <div className="prose prose-slate max-w-none">
        <h2>{copy.missionTitle}</h2>
        <p>{copy.mission}</p>

        <h2>{copy.forWhomTitle}</h2>
        <p>{copy.forWhom}</p>
      </div>

      <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
        {copy.audiences.map((item) => (
          <li key={item.href}>
            <Link
              href={localizePublicHref(item.href, locale)}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <span className="font-semibold text-[#021d33]">{item.label}</span>
              <span className="max-w-xl text-sm leading-6 text-slate-600 sm:text-right">{item.desc}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="prose prose-slate mt-10 max-w-none">
        <h2>{copy.independenceTitle}</h2>
        <p>
          {copy.independence}{" "}
          <Link href={localizePublicHref("/znacka", locale)}>{copy.brandLink}</Link>.
        </p>

        <h2>{copy.qualityTitle}</h2>
        <p>{copy.quality}</p>

        <h2>{copy.contactTitle}</h2>
        <p>
          {copy.contactBefore}{" "}
          <Link href={localizePublicHref("/kontakt", locale)}>{copy.contactLink}</Link>{" "}
          {copy.contactAfter}
        </p>
      </div>
    </ModulePageShell>
  );
}
