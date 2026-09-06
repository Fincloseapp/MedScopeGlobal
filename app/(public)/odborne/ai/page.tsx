import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.desk.ai.metaTitle,
    description: copy.desk.ai.lead,
    path: "/odborne/ai",
    locale,
  });
}

export default async function OdborneAiPage() {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const page = copy.desk.ai;

  return (
    <ModulePageShell eyebrow={page.eyebrow} title={page.title} description={page.lead}>
      <Link href={localizePublicHref("/odborne", locale)} className="mb-4 inline-block text-sm text-[#005B96]">
        {copy.back}
      </Link>
      <ModuleAiAssistant module="odborne" placeholder={copy.aiPlaceholder} />
    </ModulePageShell>
  );
}
