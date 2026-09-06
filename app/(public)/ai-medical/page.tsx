import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { AI_MEDICAL_ASSISTANTS, ASSISTANT_ROUTES } from "@/lib/ai-medical/types";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getAiMedicalHubCopy } from "@/lib/i18n/ai-medical-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getAiMedicalHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/ai-medical",
    locale,
  });
}

export default async function AiMedicalPage() {
  const locale = await getServerLocale();
  const copy = getAiMedicalHubCopy(locale);

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.title} description={copy.lead}>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AI_MEDICAL_ASSISTANTS.map((a) => (
          <Link
            key={a}
            href={localizePublicHref(ASSISTANT_ROUTES[a], locale)}
            className="rounded-xl border border-[#cfe1f3] bg-white p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-[#021d33] text-sm">{copy.assistants[a]}</p>
          </Link>
        ))}
      </div>
      <IntelligenceConsole defaultAssistant="doctor" locale={locale} />
    </ModulePageShell>
  );
}
