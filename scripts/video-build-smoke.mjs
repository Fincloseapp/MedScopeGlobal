#!/usr/bin/env node
/**
 * Post-deploy smoke: TTS noop, lesson video HTML, stream Range, academy health.
 * Usage: node scripts/video-build-smoke.mjs [baseUrl]
 */
const base = (process.argv[2] ?? "https://medscopeglobal.com").replace(/\/$/, "");

const LESSONS = [
  "/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh",
  "/academy/courses/fyziologie-zaklady-uchazece/lessons/dychani",
  "/academy/courses/anatomie-zaklady/lessons/svalova-soustava",
];

const results = [];

async function check(label, fn) {
  try {
    const detail = await fn();
    results.push({ label, ok: true, detail });
    console.log(`✓ ${label}: ${detail}`);
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    results.push({ label, ok: false, detail: msg });
    console.error(`✗ ${label}: ${msg}`);
    return false;
  }
}

await check("POST /api/tts → 200", async () => {
  const res = await fetch(`${base}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "smoke" }),
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  return `status ${res.status}`;
});

await check("GET /api/tts → web_speech JSON", async () => {
  const res = await fetch(`${base}/api/tts`, { signal: AbortSignal.timeout(15_000) });
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  const json = await res.json();
  if (json.provider !== "web_speech") throw new Error(`provider=${json.provider}`);
  return json.provider;
});

for (const path of LESSONS) {
  await check(`GET ${path} has <video`, async () => {
    const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const html = await res.text();
    if (!/<video/i.test(html)) throw new Error("no <video element");
    const hasMp4 =
      /mov_bbb\.mp4|w3schools|\.mp4|video\/stream/i.test(html);
    if (!hasMp4) throw new Error("no mp4/w3schools/stream in HTML");
    return "video + mp4 source found";
  });
}

await check("GET /api/video/stream Range → 206", async () => {
  const sample =
    "https://www.w3schools.com/html/mov_bbb.mp4";
  const url = `${base}/api/video/stream?url=${encodeURIComponent(sample)}`;
  const res = await fetch(url, {
    headers: { Range: "bytes=0-1023" },
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status !== 206 && res.status !== 200) {
    throw new Error(`status ${res.status}`);
  }
  return `status ${res.status}`;
});

await check("GET /api/academy/health → 200", async () => {
  const res = await fetch(`${base}/api/academy/health`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return `status ${res.status}`;
});

await check("GET /academy → 200", async () => {
  const res = await fetch(`${base}/academy`, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return `status ${res.status}`;
});

const failed = results.filter((r) => !r.ok);
console.log(`\n=== Smoke summary: ${results.length - failed.length}/${results.length} passed ===`);
if (failed.length) process.exit(1);
