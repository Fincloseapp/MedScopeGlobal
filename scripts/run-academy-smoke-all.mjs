#!/usr/bin/env node
/** Run all v33–v37 + academy full smoke sequentially with 2s delay */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] ?? process.env.PRODUCTION_URL ?? "https://medscopeglobal.com";

const scripts = [
  "v33-ui-smoke.mjs",
  "v34-video-engine-smoke.mjs",
  "v35-course-smoke.mjs",
  "v36-analytics-smoke.mjs",
  "v37-quality-smoke.mjs",
  "academy-v35-full-smoke.mjs",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(script) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(root, "scripts", script), base], {
      stdio: "inherit",
      cwd: root,
    });
    child.on("close", (code) => resolve({ script, code: code ?? 1 }));
  });
}

console.log(`\n=== Academy smoke ALL @ ${base} ===\n`);
const results = [];

for (const script of scripts) {
  await sleep(2000);
  const r = await run(script);
  results.push(r);
}

const failed = results.filter((r) => r.code !== 0);
console.log("\n--- Summary ---");
for (const r of results) {
  console.log(`${r.code === 0 ? "✓" : "✗"} ${r.script}`);
}
process.exit(failed.length ? 1 : 0);
