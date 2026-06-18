import { generateTextFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { countPublishedCourses, countVideoLessons } from "@/lib/academy/db";
import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import { isElevenLabsConfigured } from "@/lib/v40/ai/voice-elevenlabs";
import { isDidConfigured } from "@/lib/v40/ai/avatar-did";

export type AuditReport = {
  version: string;
  generated_at: string;
  summary: { score: number; status: string; issues_count: number };
  videos: { total: number; ready: number; with_audio: number; fallback_used: number; issues: string[] };
  courses: { total: number; published: number; with_videos: number; issues: string[] };
  medical: { reviews_count: number; avg_score: number; critical: number };
  ui: { academy_routes: string[]; admin_routes: string[] };
  metadata: { seo_issues: string[] };
  playback: { fallback_url_ok: boolean; fallback_url: string };
  engines: {
    llm: boolean;
    elevenlabs: boolean;
    did: boolean;
    v40_jobs: number;
  };
};

export async function generateAuditReport(): Promise<AuditReport> {
  const admin = createServiceRoleClient();
  const issues: string[] = [];

  let fallbackOk = false;
  try {
    const res = await fetch(V33_FALLBACK_MP4_URL, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    fallbackOk = res.ok;
  } catch {
    fallbackOk = false;
  }
  if (!fallbackOk) issues.push("w3schools fallback MP4 unreachable");

  const [courseCount, videoLessonCount] = await Promise.all([countPublishedCourses(), countVideoLessons()]);

  const { data: videos } = await admin.from("video_assets").select("id, status, metadata").limit(200);
  const ready = (videos ?? []).filter((v) => v.status === "ready");
  const withAudio = ready.filter((v) => {
    const m = (v.metadata ?? {}) as Record<string, unknown>;
    return Boolean(m.tts_audio_url);
  });
  const fallbackUsed = ready.filter((v) => {
    const m = (v.metadata ?? {}) as Record<string, unknown>;
    const url = String(m.public_url ?? "");
    return url.includes("w3schools") || url.includes("gtv-videos-bucket");
  });

  const { data: courses } = await admin.from("courses").select("id, status, metadata").limit(200);
  const published = (courses ?? []).filter((c) => c.status === "published");

  let medicalCount = 0;
  let medicalAvg = 0;
  let medicalCritical = 0;
  try {
    const { data: reviews } = await admin.from("medical_reviews").select("score, severity").limit(100);
    medicalCount = reviews?.length ?? 0;
    if (reviews?.length) {
      medicalAvg = reviews.reduce((s, r) => s + Number(r.score), 0) / reviews.length;
      medicalCritical = reviews.filter((r) => r.severity === "critical").length;
    }
  } catch {
    /* table may not exist yet */
  }

  let v40Jobs = 0;
  try {
    const { count } = await admin.from("v40_video_jobs").select("id", { count: "exact", head: true });
    v40Jobs = count ?? 0;
  } catch {
    /* ignore */
  }

  const videoIssues: string[] = [];
  if (fallbackUsed.length > ready.length * 0.5) videoIssues.push("Více než 50 % videí používá fallback URL");

  const courseIssues: string[] = [];
  if (published.length < 1) courseIssues.push("Žádné publikované kurzy");

  const score = Math.max(0, 100 - issues.length * 10 - videoIssues.length * 5 - courseIssues.length * 5);

  return {
    version: "v40.0",
    generated_at: new Date().toISOString(),
    summary: { score, status: score >= 70 ? "healthy" : "needs_attention", issues_count: issues.length + videoIssues.length + courseIssues.length },
    videos: {
      total: videos?.length ?? 0,
      ready: ready.length,
      with_audio: withAudio.length,
      fallback_used: fallbackUsed.length,
      issues: videoIssues,
    },
    courses: {
      total: courses?.length ?? 0,
      published: published.length,
      with_videos: videoLessonCount,
      issues: courseIssues,
    },
    medical: { reviews_count: medicalCount, avg_score: Math.round(medicalAvg), critical: medicalCritical },
    ui: {
      academy_routes: ["/academy", "/academy/courses", "/academy/courses/[slug]"],
      admin_routes: ["/admin/academy", "/admin/academy/audit", "/admin/academy/medical-review"],
    },
    metadata: { seo_issues: courseCount < 3 ? ["Málo publikovaných kurzů pro SEO"] : [] },
    playback: { fallback_url_ok: fallbackOk, fallback_url: V33_FALLBACK_MP4_URL },
    engines: {
      llm: isLlmConfigured(),
      elevenlabs: isElevenLabsConfigured(),
      did: isDidConfigured(),
      v40_jobs: v40Jobs,
    },
  };
}

export async function persistAuditReport(report: AuditReport): Promise<string | null> {
  const admin = createServiceRoleClient();
  try {
    const { data, error } = await admin
      .from("v40_audit_reports")
      .insert({ score: report.summary.score, report, status: report.summary.status })
      .select("id")
      .maybeSingle();
    if (error) return null;
    return data?.id ?? null;
  } catch {
    return null;
  }
}

export async function listAuditReports(limit = 20) {
  const admin = createServiceRoleClient();
  try {
    const { data } = await admin
      .from("v40_audit_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}
