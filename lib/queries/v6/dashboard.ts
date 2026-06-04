import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: studiesCount },
    { count: sourcesCount },
    { data: evidence },
    { data: alerts },
    { data: trends },
    { data: articles },
  ] = await Promise.all([
    supabase
      .from("medical_ai_texts")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("medical_sources").select("id", { count: "exact", head: true }),
    supabase.from("medical_evidence").select("evidence_level, study_type"),
    supabase
      .from("autopilot_alerts")
      .select("id, alert_type, title, severity, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("autopilot_trends")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("medical_ai_texts")
      .select("id, title, categories, specialty, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const drugSources =
    (
      await supabase
        .from("medical_sources")
        .select("id", { count: "exact", head: true })
        .in("source_type", ["fda", "ema", "sukl"])
    ).count ?? 0;

  const diagnosisCounts: Record<string, number> = {};
  for (const a of articles ?? []) {
    const d = (a.categories as { diagnosis?: string[] })?.diagnosis ?? [];
    for (const dx of d) {
      diagnosisCounts[dx] = (diagnosisCounts[dx] ?? 0) + 1;
    }
  }

  const evidenceLevels = { A: 0, B: 0, C: 0, D: 0 };
  for (const e of evidence ?? []) {
    const k = e.evidence_level as keyof typeof evidenceLevels;
    if (k in evidenceLevels) evidenceLevels[k]++;
  }

  const latestTrend = trends?.[0]?.metric as Record<string, number> | undefined;

  return {
    studiesCount: studiesCount ?? 0,
    sourcesCount: sourcesCount ?? 0,
    drugSources,
    evidenceLevels,
    alerts: alerts ?? [],
    trends: trends ?? [],
    diagnosisCounts,
    trendSeries: {
      ra: latestTrend?.ra_articles_7d ?? diagnosisCounts.ra ?? 0,
      dmards: latestTrend?.dmard_mentions_7d ?? diagnosisCounts.dmard ?? 0,
      bdmards: latestTrend?.bdmard_mentions_7d ?? 0,
    },
  };
}
