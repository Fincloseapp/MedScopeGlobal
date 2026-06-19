#!/usr/bin/env node
/** Prod smoke — TTS, stream, lesson video src */
const base = (process.argv[2] ?? "https://medscopeglobal.com").replace(/\/$/, "");

const lessons = [
  "/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh",
  "/academy/courses/fyziologie-zaklady-uchazece/lessons/bunkove-deleni",
  "/academy/courses/fyziologie-zaklady-uchazece/lessons/orientace-v-tele",
];

const results = [];

async function check(name, fn) {
  try {
    const ok = await fn();
    results.push({ name, ok });
    console.log(`${name}: ${ok ? "OK" : "FAIL"}`);
    return ok;
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
    console.log(`${name}: FAIL — ${e.message}`);
    return false;
  }
}

console.log(`\n=== Video smoke @ ${base} ===\n`);

await check("tts_post_200", async () => {
  const res = await fetch(`${base}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "test" }),
    signal: AbortSignal.timeout(30000),
  });
  return res.status === 200;
});

await check("stream_206", async () => {
  const res = await fetch(
    `${base}/api/video/stream?url=${encodeURIComponent("https://www.w3schools.com/html/mov_bbb.mp4")}`,
    { headers: { Range: "bytes=0-1023" }, signal: AbortSignal.timeout(30000) }
  );
  return res.status === 206 || res.status === 200;
});

for (const path of lessons) {
  await check(`lesson${path.split("/").pop()}`, async () => {
    const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(45000) });
    if (!res.ok) return false;
    const html = await res.text();
    return /<video[\s\S]*?<source[^>]+src=/i.test(html) || /mov_bbb\.mp4/i.test(html);
  });
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
