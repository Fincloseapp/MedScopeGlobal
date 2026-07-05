#!/usr/bin/env npx tsx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runDailyPublicOsvetaGeneration } from "@/lib/verejnost/osveta/daily-generator";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  const result = await runDailyPublicOsvetaGeneration();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.skipped ? 0 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
