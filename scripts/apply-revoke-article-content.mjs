#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SQL = fs.readFileSync(
  path.join(ROOT, "supabase/migrations/20260816181000_revoke_anon_article_content.sql"),
  "utf8"
);
const env = { ...loadProjectEnv(ROOT), ...process.env };
const ref =
  env.SUPABASE_PROJECT_REF ||
  String(env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)/)?.[1];
const token = env.SUPABASE_ACCESS_TOKEN;
if (!ref || !token) {
  console.log(JSON.stringify({ ok: false, reason: "missing_token_or_ref" }));
  process.exit(1);
}
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: SQL }),
});
const text = await res.text();
if (!res.ok) {
  console.log(JSON.stringify({ ok: false, status: res.status, detail: text.slice(0, 240) }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, method: "management_api" }));
