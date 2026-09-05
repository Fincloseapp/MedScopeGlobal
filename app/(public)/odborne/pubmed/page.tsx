import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PubMedLookupTool, RegulatoryLookupTool } from "@/components/v5plus/lookup-tool";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.desk.pubmed.metaTitle,
    description: copy.desk.pubmed.lead,
    path: "/odborne/pubmed",
    locale,
  });
}

export default async function OdbornePubmedPage() {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const page = copy.desk.pubmed;

  return (
    <ModulePageShell eyebrow={page.eyebrow} title={page.title} description={page.lead}>
      <Link href={localizePublicHref("/odborne", locale)} className="mb-6 inline-block text-sm text-[#005B96]">
        {copy.back}
      </Link>
      <div className="space-y-8">
        <PubMedLookupTool />
        <RegulatoryLookupTool />
      </div>
    </ModulePageShell>
  );
}
