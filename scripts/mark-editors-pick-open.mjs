/**
 * Mark 5 Editor's pick expert articles as fully open (public preview).
 * Uses Supabase REST API (no @supabase/supabase-js dependency).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const EDITORS_PICK_SLUGS = [
  "kardiologie-nemoci-srdce-a-cv",
  "neurologie-shrnut",
  "endokrinologie-zkladn-onemocnn-a-diagnostika",
  "diagnostika-revmatologickch-onemocnn-klov-kroky",
  "prevence-nemoc",
];

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local");
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

for (const slug of EDITORS_PICK_SLUGS) {
  const getRes = await fetch(
    `${baseUrl}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&select=id,slug,quiz_json`,
    { headers }
  );
  if (!getRes.ok) {
    console.log(`FAIL fetch ${slug}: ${getRes.status}`);
    continue;
  }
  const rows = await getRes.json();
  if (!rows?.length) {
    console.log(`SKIP (not found): ${slug}`);
    continue;
  }

  const existing = rows[0];
  const quizJson = {
    ...(typeof existing.quiz_json === "object" && existing.quiz_json ? existing.quiz_json : {}),
    editors_pick: true,
    fully_open: true,
  };

  const patchRes = await fetch(`${baseUrl}/rest/v1/articles?id=eq.${existing.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      vip_only: false,
      quiz_json: quizJson,
      updated_at: new Date().toISOString(),
    }),
  });

  console.log(patchRes.ok ? `OK ${slug}` : `FAIL ${slug}: ${patchRes.status} ${await patchRes.text()}`);
}
