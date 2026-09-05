import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getAiAssistantCopy } from "@/lib/i18n/ai-assistant-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getAiAssistantCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.physicianMetaTitle,
    description: copy.physicianMetaDescription,
    path: "/ai-asistent/lekar",
    locale,
  });
}

export default async function AiAsistentLekarPage() {
  const locale = await getServerLocale();
  const copy = getAiAssistantCopy(locale);

  return (
    <ModulePageShell
      eyebrow={copy.physicianEyebrow}
      title={copy.physicianTitle}
      description={copy.physicianLead}
    >
      <Link href={localizePublicHref("/ai-asistent", locale)} className="mb-4 inline-block text-sm text-[#005B96]">
        {copy.allAssistants}
      </Link>
      <IntelligenceConsole defaultAssistant="doctor" locale={locale} title={copy.physicianConsoleTitle} />
    </ModulePageShell>
  );
}
