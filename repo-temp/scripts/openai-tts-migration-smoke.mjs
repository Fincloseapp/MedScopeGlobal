#!/usr/bin/env node
/**
 * Post-migration smoke: OpenAI TTS, health endpoints, legacy TTS provider removed.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");

const results = [];

async function check(name, fn) {
  try {
    const r = await fn();
    results.push({ name, ok: r.ok, detail: r.detail });
  } catch (e) {
    results.push({ name, ok: false, detail: e instanceof Error ? e.message : "error" });
  }
}

function walk(dir, acc = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === ".next") continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|mjs|js)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

await check("grep:zero-legacy-tts-vendor", async () => {
  const banned = /eleven\s*labs/i;
  const hits = [];
  for (const file of walk(root)) {
    if (file.includes("openai-tts-migration-smoke")) continue;
    const text = readFileSync(file, "utf8");
    if (banned.test(text)) hits.push(file.replace(root + "\\", "").replace(root + "/", ""));
  }
  return { ok: hits.length === 0, detail: hits.length ? hits.slice(0, 10).join(", ") : "clean" };
});

await check("file:voice-openai", async () => ({
  ok: existsSync(join(root, "lib/v40/ai/voice-openai.ts")),
  detail: "OpenAI voice module",
}));

await check("file:no-legacy-voice-module", async () => ({
  ok: !existsSync(join(root, "lib/v40/ai/voice-elevenlabs.ts")),
  detail: "legacy module removed",
}));

await check("api/tts POST", async () => {
  const res = await fetch(`${target}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "MedScope OpenAI TTS smoke test." }),
    signal: AbortSignal.timeout(45000),
  });
  const ct = res.headers.get("content-type") ?? "";
  return { ok: res.ok && ct.includes("audio"), detail: `HTTP ${res.status} ${ct}` };
});

await check("api/tts GET 405", async () => {
  const res = await fetch(`${target}/api/tts`, { signal: AbortSignal.timeout(15000) });
  return { ok: res.status === 405, detail: `HTTP ${res.status}` };
});

await check("api/v40/health openai", async () => {
  const res = await fetch(`${target}/api/v40/health`, { signal: AbortSignal.timeout(20000) });
  const json = await res.json().catch(() => ({}));
  const v40 = json?.subsystems?.v40 ?? {};
  return {
    ok: res.ok && v40.openaiTts !== undefined && v40.ttsModel === "gpt-4o-mini-tts",
    detail: `openaiTts=${v40.openaiTts} model=${v40.ttsModel ?? "?"}`,
  };
});

await check("api/v41/health", async () => {
  const res = await fetch(`${target}/api/v41/health`, { signal: AbortSignal.timeout(20000) });
  const json = await res.json().catch(() => ({}));
  return {
    ok: res.ok && json?.tts?.model === "gpt-4o-mini-tts",
    detail: `openaiValid=${json?.tts?.openaiValid}`,
  };
});

await check("academy page", async () => {
  const res = await fetch(`${target}/academy`, { signal: AbortSignal.timeout(20000) });
  return { ok: res.ok, detail: `HTTP ${res.status}` };
});

await check("video stream route", async () => {
  const res = await fetch(`${target}/api/video/stream`, { signal: AbortSignal.timeout(15000) });
  return { ok: res.status === 400, detail: "expects file or url param" };
});

console.log("\n--- OpenAI TTS Migration Smoke ---");
console.log(`Target: ${target}\n`);
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
}
const failed = results.filter((r) => !r.ok).length;
process.exit(failed ? 1 : 0);
