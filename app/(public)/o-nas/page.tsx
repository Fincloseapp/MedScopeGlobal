import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";
import { SITE } from "@/lib/config/site";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";
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
  const surface = getSurfaceCopy(locale);

  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={surface.siteDescription || SITE.description}
      ctaHref={localizePublicHref("/kontakt", locale)}
      ctaLabel={copy.cta}
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

      <div className="prose prose-slate max-w-none">
        <h2>{copy.missionTitle}</h2>
        <p>{copy.mission}</p>

        <h2>{copy.forWhomTitle}</h2>
        <p>{copy.forWhom}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {copy.audiences.map((item) => (
          <Link
            key={item.href}
            href={localizePublicHref(item.href, locale)}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40 hover:shadow-sm"
          >
            <p className="font-semibold text-[#021d33]">{item.label}</p>
            <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
          </Link>
        ))}
      </div>

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
