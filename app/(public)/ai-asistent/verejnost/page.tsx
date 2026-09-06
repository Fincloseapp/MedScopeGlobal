import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";
import { getAiAssistantCopy } from "@/lib/i18n/ai-assistant-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getAiAssistantCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.publicMetaTitle,
    description: copy.publicMetaDescription,
    path: "/ai-asistent/verejnost",
    locale,
  });
}

export default async function AiAsistentVerejnostPage() {
  const locale = await getServerLocale();
  const copy = getAiAssistantCopy(locale);

  return (
    <ModulePageShell
      eyebrow={copy.publicEyebrow}
      title={copy.publicTitle}
      description={copy.publicLead}
      ctaHref={localizePublicHref("/verejnost/temata", locale)}
      ctaLabel={copy.publicCta}
    >
      <Link
        href={localizePublicHref("/verejnost", locale)}
        className="mb-4 inline-block text-sm text-[#005B96] hover:underline"
      >
        {copy.publicBack}
      </Link>

      <PublicTrustDisclaimer className="mb-6" />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-[#021d33]">{copy.publicExamplesTitle}</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {copy.publicExamples.map((q) => (
            <li key={q}>· {q}</li>
          ))}
        </ul>
      </div>

      <IntelligenceConsole publicMode locale={locale} title={copy.publicConsoleTitle} />
    </ModulePageShell>
  );
}
