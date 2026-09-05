import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMedicalAiTexts } from "@/lib/queries/v4d/medical-ai";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.desk.nejnovejsi.metaTitle,
    description: copy.desk.nejnovejsi.lead,
    path: "/odborne/nejnovejsi",
    locale,
  });
}

export default async function OdborneNejnovejsiPage() {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const page = copy.desk.nejnovejsi;
  const texts = await getMedicalAiTexts({ limit: 24 });

  return (
    <ModulePageShell eyebrow={page.eyebrow} title={page.title} description={page.lead}>
      <Link href={localizePublicHref("/odborne", locale)} className="mb-4 inline-block text-sm text-[#005B96]">
        {copy.back}
      </Link>
      <div className="grid gap-4 sm:grid-cols-2">
        {texts.map((t) => (
          <V4cContentCard
            key={t.id}
            href={localizePublicHref(`/odborne/${t.id}`, locale)}
            title={t.title}
            meta={[t.source_name, formatPublicDate(t.created_at, locale)].filter(Boolean).join(" · ")}
            summary={t.summary_clinician}
            badge={t.specialty ?? t.original_language?.toUpperCase() ?? "CS"}
          />
        ))}
      </div>
    </ModulePageShell>
  );
}
