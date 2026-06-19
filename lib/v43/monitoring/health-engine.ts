import { createServiceRoleClient } from "@/lib/supabase/service";
import { checkTtsHealth } from "@/lib/v41/ai/tts-engine";
import { isGroqConfigured } from "@/lib/ai/groq-client";
import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import { V46_LAST_STABLE_SHA } from "@/lib/v46/version";

export type HealthCheck = {
  subsystem: string;
  status: "ok" | "degraded" | "critical";
  message: string;
  latency_ms?: number;
};

export type HealthReport = {
  overall: "ok" | "degraded" | "critical";
  score: number;
  checks: HealthCheck[];
  last_stable_sha: string;
  generated_at: string;
  auto_heal: string[];
};

async function timedCheck(name: string, fn: () => Promise<HealthCheck>): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const result = await fn();
    return { ...result, latency_ms: Date.now() - start };
  } catch (e) {
    return {
      subsystem: name,
      status: "critical",
      message: e instanceof Error ? e.message : "check failed",
      latency_ms: Date.now() - start,
    };
  }
}

async function logHealthEvent(
  event_type: string,
  subsystem: string,
  status: string,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    const admin = createServiceRoleClient();
    await admin.from("system_health_events").insert({
      event_type,
      subsystem,
      status,
      message,
      metadata,
    });
  } catch {
    /* table may not exist */
  }
}

export async function runHealthMonitor(): Promise<HealthReport> {
  const checks: HealthCheck[] = [];

  checks.push(
    await timedCheck("database", async () => {
      const admin = createServiceRoleClient();
      const { error } = await admin.from("courses").select("id").limit(1);
      return error
        ? { subsystem: "database", status: "critical", message: error.message }
        : { subsystem: "database", status: "ok", message: "Supabase reachable" };
    })
  );

  checks.push(
    await timedCheck("tts_web_speech", async () => {
      const health = await checkTtsHealth();
      return {
        subsystem: "tts_web_speech",
        status: health.valid ? "ok" : "degraded",
        message: health.detail ?? "Web Speech API (free, client-side)",
      };
    })
  );

  checks.push(
    await timedCheck("groq_llm", async () => {
      if (!isGroqConfigured()) {
        return { subsystem: "groq_llm", status: "degraded", message: "GROQ_API_KEY not set" };
      }
      return { subsystem: "groq_llm", status: "ok", message: "GROQ configured" };
    })
  );

  checks.push(
    await timedCheck("video_fallback", async () => {
      try {
        const res = await fetch(V33_FALLBACK_MP4_URL, { method: "HEAD", signal: AbortSignal.timeout(8000) });
        return res.ok
          ? { subsystem: "video_fallback", status: "ok", message: "Fallback MP4 reachable" }
          : { subsystem: "video_fallback", status: "degraded", message: `Fallback MP4 HTTP ${res.status}` };
      } catch {
        return { subsystem: "video_fallback", status: "degraded", message: "Fallback MP4 unreachable" };
      }
    })
  );

  checks.push(
    await timedCheck("api_v40_health", async () => {
      const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://medscopeglobal.com";
      const res = await fetch(`${base}/api/v40/health`, { signal: AbortSignal.timeout(10000) });
      return res.ok
        ? { subsystem: "api_v40_health", status: "ok", message: "v40 health OK" }
        : { subsystem: "api_v40_health", status: "degraded", message: `v40 health HTTP ${res.status}` };
    })
  );

  const critical = checks.filter((c) => c.status === "critical").length;
  const degraded = checks.filter((c) => c.status === "degraded").length;
  const ok = checks.filter((c) => c.status === "ok").length;
  const score = Math.round((ok * 100 + degraded * 60) / Math.max(checks.length, 1) - critical * 15);
  const overall: HealthReport["overall"] =
    critical > 0 ? "critical" : degraded > 0 ? "degraded" : "ok";

  const auto_heal: string[] = [];
  if (checks.some((c) => c.subsystem === "groq_llm" && c.status === "degraded")) {
    auto_heal.push("LLM: set GROQ_API_KEY on Vercel");
  }
  if (degraded > 0) {
    auto_heal.push(`Logged ${degraded} degraded subsystem(s) for review`);
  }

  for (const c of checks.filter((x) => x.status !== "ok")) {
    await logHealthEvent("health_check", c.subsystem, c.status, c.message);
  }

  return {
    overall,
    score: Math.max(0, Math.min(100, score)),
    checks,
    last_stable_sha: V46_LAST_STABLE_SHA,
    generated_at: new Date().toISOString(),
    auto_heal,
  };
}
