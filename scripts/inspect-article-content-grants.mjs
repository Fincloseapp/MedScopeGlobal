#!/usr/bin/env node
import { loadProjectEnv } from "./load-env.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...loadProjectEnv(ROOT), ...process.env };
const ref =
  env.SUPABASE_PROJECT_REF ||
  String(env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)/)?.[1];
const token = env.SUPABASE_ACCESS_TOKEN;
const sql = `
select grantee, privilege_type, column_name
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'articles'
  and column_name in ('content', 'quiz_json')
order by column_name, grantee, privilege_type;
`;
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
console.log(JSON.stringify({ status: res.status, body: text.slice(0, 2000) }, null, 2));
