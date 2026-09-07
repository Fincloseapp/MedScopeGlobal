import { AdPortalForm } from "@/components/firmy/ad-portal-form";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { SocialShareStrip } from "@/components/social/social-share-strip";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getAdPortalCopy } from "@/lib/i18n/ad-portal-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getAdPortalCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/firmy/reklama/nova",
    locale,
  });
}

export default async function NewAdPortalPage() {
  const locale = await getServerLocale();
  const copy = getAdPortalCopy(locale);
  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      ctaHref={localizePublicHref("/firmy/cenik", locale)}
      ctaLabel={copy.ctaLabel}
      homeHref={localizePublicHref("/firmy", locale)}
    >
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
        {copy.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <AdPortalForm locale={locale} />
      <div className="mt-8">
        <SocialShareStrip title={copy.shareTitle} path="/firmy/reklama/nova" locale={locale} />
      </div>
    </ModulePageShell>
  );
}
