import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getEvidenceList } from "@/lib/queries/v5plus/evidence";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Evidence-based scoring" };

export default async function OdborneEvidencePage() {
  const evidence = await getEvidenceList(30);
  const supabase = await createClient();
  const ids = evidence.map((e) => e.article_id);
  const titles: Record<string, string> = {};

  if (ids.length) {
    const { data } = await supabase
      .from("medical_ai_texts")
      .select("id, title")
      .in("id", ids);
    for (const t of data ?? []) titles[t.id] = t.title;
  }

  return (
    <ModulePageShell
      eyebrow="Evidence Engine"
      title="Evidence-based scoring"
      description="Úroveň důkazů A–D, typ studie, klinický dopad, síla doporučení — Groq Llama 3.3."
    >
      <Link href="/odborne" className="text-sm text-[#005B96] mb-6 inline-block">
        ← Odborné texty
      </Link>
      <div className="space-y-4">
        {evidence.map((e) => (
          <article
            key={e.id}
            className="rounded-xl border border-[#cfe1f3] bg-white p-5 text-sm"
          >
            <div className="flex flex-wrap gap-2 items-center">
              <span className="rounded-full bg-[#005B96] text-white px-3 py-0.5 text-xs font-bold">
                {e.evidence_level}
              </span>
              <span className="text-slate-500">{e.study_type}</span>
              {e.sample_size ? (
                <span className="text-slate-500">n={e.sample_size}</span>
              ) : null}
            </div>
            <h2 className="font-semibold text-[#021d33] mt-2">
              <Link href={`/odborne/${e.article_id}`} className="hover:underline">
                {titles[e.article_id] ?? "Článek"}
              </Link>
            </h2>
            <p className="mt-2 text-slate-700">{e.clinical_conclusions}</p>
            <p className="mt-2 text-xs text-slate-500">
              Dopad: {e.clinical_relevance} · Doporučení: {e.recommendation_strength} ·
              Data: {e.data_quality}
            </p>
          </article>
        ))}
      </div>
      {evidence.length === 0 ? (
        <p className="text-sm text-slate-600">Zatím žádné evidence záznamy.</p>
      ) : null}
    </ModulePageShell>
  );
}
