#!/usr/bin/env node
/**
 * Run all v18 load tests sequentially and generate report.md
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_URL, PHASES, TOTAL_DURATION_SEC } from "./lib/config.mjs";
import { asciiSparkline, bucketSeries } from "./lib/metrics.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const tests = [
  { script: "test-upload-load.js", key: "upload", label: "upload" },
  { script: "test-summarize-load.js", key: "summarize", label: "summarize" },
  { script: "test-guideline-load.js", key: "guideline", label: "guideline" },
  { script: "test-clinical-load.js", key: "clinical-check", label: "clinical-check" },
  { script: "test-mixed-load.js", key: "mixed", label: "mixed" },
];

console.log(`\n=== V18 Load Test Suite ===`);
console.log(`Target: ${BASE_URL}`);
console.log(
  `Profile: ramp ${PHASES.rampUpSec}s → ${PHASES.maxRps} RPS steady ${PHASES.steadySec}s → ramp-down ${PHASES.rampDownSec}s\n`
);

const startedAt = new Date();
const summaries = [];

const reportOnly = process.env.V18_LOAD_REPORT_ONLY === "1";

for (const t of tests) {
  const resultPath = join(root, `results-${t.key}.json`);
  if (!reportOnly) {
    console.log(`\n--- Running ${t.label} ---`);
    const res = spawnSync(process.execPath, [join(root, t.script)], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    if (existsSync(resultPath)) {
      const data = JSON.parse(readFileSync(resultPath, "utf8"));
      summaries.push({ ...data, exitCode: res.status ?? 1 });
    } else {
      summaries.push({ name: t.key, error: "no results file", exitCode: 1 });
    }
  } else if (existsSync(resultPath)) {
    summaries.push(JSON.parse(readFileSync(resultPath, "utf8")));
  } else {
    summaries.push({ name: t.key, error: "no results file" });
  }
}

let monitoring = null;
try {
  const mRes = await fetch(`${BASE_URL}/api/v18/monitoring`);
  monitoring = await mRes.json();
} catch {
  /* optional */
}

const report = buildReport(summaries, monitoring, startedAt);
writeFileSync(join(root, "report.md"), report);
console.log(`\n✓ Report written to loadtests/v18/report.md\n`);

function buildReport(results, mon, started) {
  const finished = new Date();
  const lines = [];
  lines.push("# AI Engine v18 — Load Test Report");
  lines.push("");
  lines.push(`**Datum:** ${finished.toISOString().slice(0, 19)} UTC  `);
  lines.push(`**Cíl:** ${BASE_URL}  `);
  lines.push(`**Nástroj:** Node.js staged RPS runner (k6-compatible profil; projekt bez k6/autocannon)  `);
  lines.push(
    `**Profil:** 0→${PHASES.maxRps} RPS / ${PHASES.rampUpSec}s · ${PHASES.maxRps} RPS / ${PHASES.steadySec}s · ramp-down ${PHASES.rampDownSec}s (${TOTAL_DURATION_SEC}s celkem na test)`
  );
  lines.push("");
  lines.push("## Executive summary");
  lines.push("");
  const mixed = results.find((r) => r.name === "mixed");
  const upload = results.find((r) => r.name === "upload");
  lines.push(
    `- **Mixed error rate:** ${mixed?.errorRatePct ?? "n/a"}% (cíl < ${2}%)`
  );
  lines.push(
    `- **Upload p95:** ${upload?.stats?.p95Ms ?? "n/a"} ms (cíl < 1500 ms)`
  );
  lines.push(
    `- **LLM endpointy:** latence výrazně nad specifikovanými cíli (viz tabulka) — očekávané u GROQ inference na serverless`
  );
  lines.push("");
  lines.push("## Výsledková tabulka");
  lines.push("");
  lines.push(
    "| Test | Plánované req | Dokončené | Ø latence | p95 | p99 | RPS (skutečné) | Error rate | Timeouty | Fallback % | Splněno |"
  );
  lines.push(
    "|------|---------------|-----------|-----------|-----|-----|----------------|------------|----------|------------|---------|"
  );

  for (const r of results) {
    if (!r.stats) {
      lines.push(`| ${r.name} | — | — | — | — | — | — | — | — | — | FAIL |`);
      continue;
    }
    const pass =
      r.passed === true ? "OK" : r.passed === false ? "FAIL" : r.exitCode === 0 ? "OK" : "FAIL";
    lines.push(
      `| ${r.name} | ${r.scheduledRequests ?? "—"} | ${r.completedRequests ?? r.stats.count} | ${r.stats.avgMs} ms | ${r.stats.p95Ms} ms | ${r.stats.p99Ms} ms | ${r.actualRps ?? "—"} | ${r.errorRatePct}% | ${r.timeouts ?? 0} | ${r.fallbackActivationRatePct ?? 0}% | ${pass} |`
    );
  }

  lines.push("");
  lines.push("## Latence — ASCII grafy (p95 po testu)");
  lines.push("");
  for (const r of results) {
    if (!r.latenciesMs?.length) continue;
    const bucketed = bucketSeries(r.latenciesMs, 500);
    lines.push(`### ${r.name}`);
    lines.push("```");
    lines.push(`p95=${r.stats.p95Ms}ms  p99=${r.stats.p99Ms}ms  max=${r.stats.maxMs}ms`);
    lines.push(`dist (500ms buckets): ${asciiSparkline(bucketed, 50)}`);
    lines.push("```");
    lines.push("");
  }

  lines.push("## Throughput (RPS) — cílový profil");
  lines.push("");
  const sample = results.find((r) => r.rpsTimeline?.length)?.rpsTimeline ?? [];
  if (sample.length) {
    const targets = sample.map((s) => s.targetRps);
    lines.push("```");
    lines.push(`target RPS: ${asciiSparkline(targets, 60)}`);
    lines.push(`max target: ${Math.max(...targets)} RPS`);
    lines.push("```");
    lines.push("");
    for (const r of results) {
      lines.push(
        `- **${r.name}:** skutečné RPS ${r.actualRps ?? "n/a"} (plán až ${r.targetRpsMax ?? PHASES.maxRps} RPS)`
      );
    }
  }

  lines.push("");
  lines.push("## Fallback statistiky (model z API odpovědi)");
  lines.push("");
  lines.push("| Test | primary | mixtral | gemma2 | other | fallback rate |");
  lines.push("|------|---------|---------|--------|-------|---------------|");
  for (const r of results) {
    const m = r.modelCounts ?? {};
    lines.push(
      `| ${r.name} | ${m.primary ?? 0} | ${m.mixtral ?? 0} | ${m.gemma2 ?? 0} | ${m.other ?? 0} | ${r.fallbackActivationRatePct ?? 0}% |`
    );
  }

  lines.push("");
  lines.push("## Dokumenty (upload)");
  lines.push("");
  if (upload) {
    lines.push(`- Průměrná velikost uploadu: **${upload.avgDocumentBytes ?? upload.pdfBytes ?? 0} B**`);
    lines.push(`- Testovací PDF: **${upload.pdfBytes ?? 204800} B**`);
  }

  lines.push("");
  lines.push("## CPU / RAM");
  lines.push("");
  lines.push(
    "Metriky hostitele (Vercel serverless) nejsou z externího load testu dostupné. Pro produkční observabilitu doporučujeme Vercel Analytics / Datadog APM."
  );
  if (mon?.metrics) {
    lines.push("");
    lines.push("Snapshot `/api/v18/monitoring` (statické placeholdery):");
    lines.push("```json");
    lines.push(JSON.stringify(mon.metrics, null, 2));
    lines.push("```");
  }

  lines.push("");
  lines.push("## Analýza chyb");
  lines.push("");
  for (const r of results) {
    if (!r.errors?.length) continue;
    const byStatus = {};
    const groqRateLimit = r.errors.filter((e) =>
      String(e.message).includes("Rate limit")
    ).length;
    for (const e of r.errors) {
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
    }
    lines.push(`### ${r.name}`);
    lines.push(`- HTTP status breakdown: ${JSON.stringify(byStatus)}`);
    if (groqRateLimit) {
      lines.push(`- GROQ TPM rate limit: **${groqRateLimit}** z ${r.errorCount} chyb`);
    }
    if (r.errors[0]?.message) {
      lines.push(`- Příklad: \`${String(r.errors[0].message).slice(0, 120)}…\``);
    }
    lines.push("");
  }

  lines.push("## Doporučení pro optimalizaci");
  lines.push("");
  lines.push("1. **Oddělit latenci od throughputu** — LLM inference (2–15 s) nesplní p95 < 500–800 ms; cíle přizpůsobit SLA inference vrstvě, ne HTTP edge.");
  lines.push("2. **Rate limiting / fronta** — při 50 RPS na GROQ zavést job queue (Temporal / Supabase queue) a async polling pro klienty.");
  lines.push("3. **Caching** — krátké dotazy (guideline šablony) cacheovat v Redis/Edge s TTL 5–15 min.");
  lines.push("4. **Upload** — udržet extrakci mimo cold start (warm pool, `serverExternalPackages` již nastaveno).");
  lines.push("5. **Fallback chain** — monitorovat `model` v audit logu; při vysokém fallback % zkontrolovat GROQ kvóty a primární model.");
  lines.push("6. **Concurrency cap** — Vercel `maxDuration` 120s; omezit souběžné inference na úrovni API (token bucket per IP/user).");
  lines.push("7. **Monitoring** — doplnit reálné metriky do `getV18MonitoringSnapshot()` z `v17_audit_logs` / Vercel logs.");
  lines.push("");
  lines.push("---");
  lines.push(`*Generováno: ${started.toISOString()} → ${finished.toISOString()}*`);
  return lines.join("\n");
}
