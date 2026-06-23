import { createClient } from "@/lib/supabase/server";
import type { PersonalizationAudience } from "@/lib/v6/personalization-config";

const AUDIENCE_FILTERS: Record<
  PersonalizationAudience,
  { specialties?: string[]; categoryHints: string[] }
> = {
  lekari: {
    specialties: ["rheumatology", "internal", "pharmacology"],
    categoryHints: ["rct", "meta-analysis", "level-1", "level-2"],
  },
  pacienti: {
    categoryHints: ["patient", "summary_patient", "moderate-impact"],
  },
  vyzkum: {
    categoryHints: ["rct", "meta-analysis", "cohort", "research"],
  },
  legislativa: {
    categoryHints: ["legislativa", "mzcr", "sukl", "ema", "fda"],
  },
};

export async function getPersonalizedFeed(audience: PersonalizationAudience, limit = 16) {
  const supabase = await createClient();
  const filter = AUDIENCE_FILTERS[audience];

  let q = supabase
    .from("medical_ai_texts")
    .select("id, title, slug, summary_clinician, summary_patient, specialty, categories, created_at")
    .eq("published", true)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (filter.specialties?.length) {
    q = q.in("specialty", filter.specialties);
  }

  const { data } = await q;

  const scored = (data ?? [])
    .map((row) => {
      const blob = JSON.stringify(row.categories ?? {}).toLowerCase();
      let score = 0;
      for (const hint of filter.categoryHints) {
        if (blob.includes(hint)) score += 2;
      }
      if (audience === "pacienti" && row.summary_patient) score += 3;
      if (audience === "lekari" && row.summary_clinician) score += 2;
      const meta = row.categories as { v6_autopublish?: boolean };
      if (meta?.v6_autopublish) score += 1;
      return { row, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.row);

  return scored;
}
