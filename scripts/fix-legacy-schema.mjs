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
const sql = `
  alter table if exists public.article_translations
    add column if not exists locale text;

  update public.article_translations
  set locale = language_code
  where locale is null and language_code is not null;

  create unique index if not exists article_translations_article_id_locale_uidx
    on public.article_translations (article_id, locale);

  alter table if exists public.rubrics
    add column if not exists name text;

  update public.rubrics
  set name = slug
  where name is null or name = '';
`;

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
