#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const files = process.argv.slice(2);
const keys = [
  "CRON_SECRET",
  "POSTGRES_PASSWORD",
  "DATABASE_URL",
  "DIRECT_URL",
  "VERCEL_TOKEN",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "POSTGRES_HOST",
  "POSTGRES_USER",
];

function analyze(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log("MISSING " + filePath);
    return;
  }
  const t = fs.readFileSync(filePath, "utf8");
  console.log("FILE " + filePath);
  for (const k of keys) {
    const m = t.match(new RegExp("^" + k + "=(.*)$", "m"));
    if (!m) {
      console.log("  " + k + " present=false");
      continue;
    }
    let v = m[1].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    const placeholder = ["[SENSITIVE]", "[REDACTED]", "******"].includes(v) ||
      v.startsWith("your_") ||
      v.includes("example.com") ||
      v.includes("xxxxx");
    let host = "";
    if (/^postgres/i.test(v)) {
      try {
        host = new URL(v).hostname;
      } catch {
        host = "unparseable";
      }
    }
    console.log(
      "  " +
        k +
        " present=true len=" +
        v.length +
        " placeholder=" +
        placeholder +
        (host ? " host=" + host : "")
    );
  }
}

for (const f of files) analyze(path.resolve(f));
