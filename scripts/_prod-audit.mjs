#!/usr/bin/env node
const base = process.env.PRODUCTION_URL ?? "https://medscopeglobal.com";

async function main() {
  const tts = await fetch(`${base}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "test" }),
    signal: AbortSignal.timeout(30000),
  });
  console.log("tts_post", tts.status);

  const stream = await fetch(
    `${base}/api/video/stream?url=${encodeURIComponent("https://www.w3schools.com/html/mov_bbb.mp4")}`,
    { headers: { Range: "bytes=0-1023" }, signal: AbortSignal.timeout(30000) }
  );
  console.log("stream", stream.status);

  const lesson = await fetch(
    `${base}/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh`,
    { signal: AbortSignal.timeout(45000) }
  );
  const html = await lesson.text();
  console.log("lesson", lesson.status, "len", html.length);
  const hasVideo = /<video[\s\S]*?<source/i.test(html);
  const srcMatch = html.match(/<source[^>]+src=["']([^"']+)["']/i);
  console.log("has_video", hasVideo, "src", srcMatch?.[1]?.slice(0, 120) ?? "none");

  const gh = await fetch("https://api.github.com/repos/Fincloseapp/MedScopeGlobal/commits/main", {
    headers: { "User-Agent": "medscope-audit" },
    signal: AbortSignal.timeout(20000),
  });
  const commit = await gh.json();
  console.log("github_main", (commit.sha ?? "").slice(0, 7));
}

main().catch((e) => {
  console.error("audit_failed", e.message);
  process.exit(1);
});
