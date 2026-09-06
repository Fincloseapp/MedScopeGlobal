import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { JobPostForm } from "@/components/forms/job-post-form";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getKarieraHubCopy } from "@/lib/i18n/kariera-hub-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getKarieraHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.addMetaTitle,
    description: copy.addMetaDescription,
    path: "/kariera/pridat",
    locale,
  });
}

export default async function KarieraPridatPage() {
  const locale = await getServerLocale();
  const copy = getKarieraHubCopy(locale);
  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.addTitle} description={copy.addLead}>
      <JobPostForm locale={locale} />
    </ModulePageShell>
  );
}
