import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const ref = env.SUPABASE_PROJECT_REF;
const token = env.SUPABASE_ACCESS_TOKEN;
const queries = [
  "select column_name from information_schema.columns where table_schema='public' and table_name='article_translations' order by ordinal_position;",
  "select column_name from information_schema.columns where table_schema='public' and table_name='rubrics' order by ordinal_position;",
];

for (const sql of queries) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log(text);
}
