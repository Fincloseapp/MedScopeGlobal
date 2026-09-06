import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { AdRequestForm } from "@/components/forms/ad-request-form";
import { getAdRequestCopy } from "@/lib/i18n/ad-request-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getAdRequestCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/inzerce/formular",
    locale,
  });
}

export default async function InzerceFormularPage() {
  const locale = await getServerLocale();
  const copy = getAdRequestCopy(locale);
  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.title} description={copy.lead}>
      <AdRequestForm locale={locale} />
    </ModulePageShell>
  );
}
