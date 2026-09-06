import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { ASSISTANT_ROUTES, type AiMedicalAssistant } from "@/lib/ai-medical/types";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getAiMedicalHubCopy } from "@/lib/i18n/ai-medical-hub-copy";
import { getAiAssistantCopy } from "@/lib/i18n/ai-assistant-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateAiMedicalDeskMetadata(
  assistant: AiMedicalAssistant
): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getAiMedicalHubCopy(locale);
  const desk = copy.desks[assistant];
  return await buildLocalizedV20PageMetadata({
    title: desk.title,
    description: desk.lead,
    path: ASSISTANT_ROUTES[assistant],
    locale,
  });
}

export async function AiMedicalDeskPage({ assistant }: { assistant: AiMedicalAssistant }) {
  const locale = await getServerLocale();
  const copy = getAiMedicalHubCopy(locale);
  const ai = getAiAssistantCopy(locale);
  const desk = copy.desks[assistant];

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={desk.title} description={desk.lead}>
      <Link
        href={localizePublicHref("/ai-medical", locale)}
        className="text-sm text-[#005B96] mb-4 inline-block"
      >
        {ai.allAssistants}
      </Link>
      <IntelligenceConsole defaultAssistant={assistant} locale={locale} />
    </ModulePageShell>
  );
}
