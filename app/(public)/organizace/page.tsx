import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import { ORGANIZACE_SECTIONS } from "@/lib/b2b/content";
import { B2bPartnerForm } from "@/components/forms/b2b-partner-form";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getOrganizaceHubCopy } from "@/lib/i18n/organizace-hub-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOrganizaceHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/organizace",
    locale,
  });
}

export default async function OrganizacePage() {
  const locale = await getServerLocale();
  const copy = getOrganizaceHubCopy(locale);

  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.lead}
      ctaHref={localizePublicHref("/organizace/partnerstvi", locale)}
      ctaLabel={copy.cta}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORGANIZACE_SECTIONS.map((s) => {
          const localized = copy.sections.find((item) => item.slug === s.slug);
          return (
            <FeatureCard
              key={s.slug}
              title={localized?.title ?? s.title}
              description={localized?.description ?? s.description}
              href={localizePublicHref(s.href, locale)}
            />
          );
        })}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.overview}</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {copy.bullets.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link
              href={localizePublicHref("/organizace/licence", locale)}
              className="text-[#005B96] font-semibold hover:underline"
            >
              {copy.licencesLink}
            </Link>
          </p>
        </div>
        <B2bPartnerForm inquiryType="organizace" locale={locale} />
      </div>
    </ModulePageShell>
  );
}
