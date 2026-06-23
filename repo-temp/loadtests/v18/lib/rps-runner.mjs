import { performance } from "node:perf_hooks";
import { targetRpsAt, TOTAL_DURATION_SEC } from "./config.mjs";
import { detectFallbackModel, summarizeLatencies } from "./metrics.mjs";

/**
 * k6-style staged RPS load runner (Node native — no k6/autocannon binary required).
 */
export async function runRpsLoad({
  name,
  durationSec = TOTAL_DURATION_SEC,
  requestFn,
  maxInflight = 300,
  timeoutMs = 120_000,
  tickMs = 100,
}) {
  const startedAt = performance.now();
  const latenciesMs = [];
  const rpsTimeline = [];
  const errors = [];
  let timeouts = 0;
  let completed = 0;
  let inFlight = 0;
  const modelCounts = { primary: 0, mixtral: 0, gemma2: 0, other: 0, unknown: 0 };
  let totalDocumentBytes = 0;
  let documentSamples = 0;

  const schedule = [];
  let tick = 0;

  while (tick * tickMs < durationSec * 1000) {
    const elapsedSec = (tick * tickMs) / 1000;
    const targetRps = targetRpsAt(elapsedSec);
    const requestsThisTick = Math.round((targetRps * tickMs) / 1000);
    rpsTimeline.push({ elapsedSec, targetRps, scheduled: requestsThisTick });
    for (let i = 0; i < requestsThisTick; i++) {
      schedule.push(elapsedSec + (i / Math.max(requestsThisTick, 1)) * (tickMs / 1000));
    }
    tick += 1;
  }

  let scheduleIdx = 0;
  const testStart = performance.now();

  return new Promise((resolve) => {
    const pump = setInterval(() => {
      const elapsedSec = (performance.now() - testStart) / 1000;
      if (elapsedSec >= durationSec && inFlight === 0 && scheduleIdx >= schedule.length) {
        clearInterval(pump);
        finish();
        return;
      }

      while (
        scheduleIdx < schedule.length &&
        schedule[scheduleIdx] <= elapsedSec &&
        inFlight < maxInflight
      ) {
        const fireAt = schedule[scheduleIdx++];
        void executeOne(fireAt);
      }

      if (elapsedSec >= durationSec + 5 && inFlight === 0) {
        clearInterval(pump);
        finish();
      }
    }, tickMs);

    async function executeOne(_scheduledAt) {
      inFlight += 1;
      const t0 = performance.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const result = await requestFn({ signal: controller.signal });
        const ms = performance.now() - t0;
        latenciesMs.push(ms);
        completed += 1;

        if (result.model) {
          const bucket = detectFallbackModel(result.model);
          modelCounts[bucket] = (modelCounts[bucket] ?? 0) + 1;
        }
        if (result.documentBytes) {
          totalDocumentBytes += result.documentBytes;
          documentSamples += 1;
        }
        if (!result.ok) {
          errors.push({
            status: result.status,
            message: result.message ?? "request failed",
            latencyMs: Math.round(ms),
          });
        }
      } catch (error) {
        const ms = performance.now() - t0;
        latenciesMs.push(ms);
        const isTimeout =
          error?.name === "AbortError" ||
          /abort|timeout/i.test(error?.message ?? "");
        if (isTimeout) timeouts += 1;
        errors.push({
          status: isTimeout ? "timeout" : "error",
          message: error instanceof Error ? error.message : String(error),
          latencyMs: Math.round(ms),
        });
      } finally {
        clearTimeout(timer);
        inFlight -= 1;
      }
    }

    function finish() {
      const wallMs = performance.now() - startedAt;
      const stats = summarizeLatencies(latenciesMs);
      const totalAttempts = latenciesMs.length;
      const errorRate = totalAttempts ? errors.length / totalAttempts : 0;
      const actualRps = totalAttempts / (wallMs / 1000);
      const scheduledTotal = schedule.length;
      const fallbackTotal =
        modelCounts.mixtral + modelCounts.gemma2 + modelCounts.other;
      const modelKnown =
        modelCounts.primary +
        modelCounts.mixtral +
        modelCounts.gemma2 +
        modelCounts.other;

      resolve({
        name,
        durationSec,
        wallMs: Math.round(wallMs),
        scheduledRequests: scheduledTotal,
        completedRequests: completed,
        stats,
        actualRps: Math.round(actualRps * 100) / 100,
        targetRpsMax: Math.max(...rpsTimeline.map((r) => r.targetRps), 0),
        errorCount: errors.length,
        errorRatePct: Math.round(errorRate * 10000) / 100,
        timeouts,
        modelCounts,
        fallbackActivationRatePct:
          modelKnown > 0
            ? Math.round((fallbackTotal / modelKnown) * 10000) / 100
            : 0,
        avgDocumentBytes:
          documentSamples > 0 ? Math.round(totalDocumentBytes / documentSamples) : 0,
        documentSamples,
        rpsTimeline,
        latenciesMs,
        errors: errors.slice(0, 20),
        cpuRam: null,
      });
    }
  });
}

export async function postJson(baseUrl, path, body, { signal, timeoutMs = 120_000 } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  let json = {};
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  return {
    ok: res.ok && json.status === "ok",
    status: res.status,
    model: json.model,
    message: json.message,
  };
}

export async function postUpload(baseUrl, buffer, filename, { signal, timeoutMs = 30_000 } = {}) {
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "application/pdf" }), filename);
  const res = await fetch(`${baseUrl}/api/v18/upload`, {
    method: "POST",
    body: form,
    signal,
  });
  let json = {};
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  return {
    ok: res.ok && json.status === "ok",
    status: res.status,
    documentBytes: json.byteLength ?? buffer.length,
    message: json.message,
  };
}
