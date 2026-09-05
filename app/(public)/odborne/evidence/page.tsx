import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getEvidenceList } from "@/lib/queries/v5plus/evidence";
import { createClient } from "@/lib/supabase/server";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.desk.evidence.metaTitle,
    description: copy.desk.evidence.lead,
    path: "/odborne/evidence",
    locale,
  });
}

export default async function OdborneEvidencePage() {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const page = copy.desk.evidence;
  const evidence = await getEvidenceList(30);
  const supabase = await createClient();
  const ids = evidence.map((e) => e.article_id);
  const titles: Record<string, string> = {};

  if (ids.length) {
    const { data } = await supabase.from("medical_ai_texts").select("id, title").in("id", ids);
    for (const t of data ?? []) titles[t.id] = t.title;
  }

  return (
    <ModulePageShell eyebrow={page.eyebrow} title={page.title} description={page.lead}>
      <Link href={localizePublicHref("/odborne", locale)} className="mb-6 inline-block text-sm text-[#005B96]">
        {copy.back}
      </Link>
      <div className="space-y-4">
        {evidence.map((e) => (
          <article key={e.id} className="rounded-xl border border-[#cfe1f3] bg-white p-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#005B96] px-3 py-0.5 text-xs font-bold text-white">
                {e.evidence_level}
              </span>
              <span className="text-slate-500">{e.study_type}</span>
              {e.sample_size ? <span className="text-slate-500">n={e.sample_size}</span> : null}
            </div>
            <h2 className="mt-2 font-semibold text-[#021d33]">
              <Link href={localizePublicHref(`/odborne/${e.article_id}`, locale)} className="hover:underline">
                {titles[e.article_id] ?? copy.articleFallback}
              </Link>
            </h2>
            <p className="mt-2 text-slate-700">{e.clinical_conclusions}</p>
            <p className="mt-2 text-xs text-slate-500">
              {copy.impact}: {e.clinical_relevance} · {copy.recommendation}: {e.recommendation_strength} ·{" "}
              {copy.dataQuality}: {e.data_quality}
            </p>
          </article>
        ))}
      </div>
      {evidence.length === 0 ? <p className="text-sm text-slate-600">{page.empty}</p> : null}
    </ModulePageShell>
  );
}
