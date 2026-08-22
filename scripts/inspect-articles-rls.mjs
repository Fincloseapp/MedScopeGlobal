#!/usr/bin/env node
import fs from "node:fs";
import { loadProjectEnv } from "./load-env.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...loadProjectEnv(ROOT), ...process.env };
const ref =
  env.SUPABASE_PROJECT_REF ||
  String(env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)/)?.[1];
const token = env.SUPABASE_ACCESS_TOKEN;
const sql = fs.readFileSync(path.join(ROOT, "scripts/inspect-articles-rls.sql"), "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
console.log(JSON.stringify({ status: res.status, body: text.slice(0, 2500) }, null, 2));
