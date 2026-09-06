import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { CongressForm } from "@/components/forms/congress-form";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getKongresyHubCopy } from "@/lib/i18n/kongresy-hub-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getKongresyHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.addMetaTitle,
    description: copy.addMetaDescription,
    path: "/kongresy/pridat",
    locale,
  });
}

export default async function KongresyPridatPage() {
  const locale = await getServerLocale();
  const copy = getKongresyHubCopy(locale);
  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.addTitle} description={copy.addLead}>
      <CongressForm locale={locale} />
    </ModulePageShell>
  );
}
