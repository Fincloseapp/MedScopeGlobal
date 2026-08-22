#!/usr/bin/env node
/**
 * Live-check export button labels (Word / PDF / Tisk). No passwords, no note bodies.
 * Run: npx tsx scripts/live-check-export-labels.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { loadProjectEnv } from "./load-env.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMAIL = "testd@medscopeglobal.com";
const CANDIDATE_PASSWORDS = ["David", "David0"];
const BASE = "https://medscopeglobal.com";
const env = { ...loadProjectEnv(ROOT), ...process.env };

const auth = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
let session = null;
let passwordVariant = null;
for (const password of CANDIDATE_PASSWORDS) {
  const { data, error } = await auth.auth.signInWithPassword({ email: EMAIL, password });
  if (!error && data.session) {
    session = data.session;
    passwordVariant = password === "David" ? "script-default" : "script-fallback";
    break;
  }
}
if (!session) {
  console.log(JSON.stringify({ ok: false, reason: "testd_sign_in_failed" }));
  process.exit(1);
}

const projectRef = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const cookieName = `sb-${projectRef}-auth-token`;
const sessionPayload = JSON.stringify({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
  expires_at: session.expires_at,
  expires_in: session.expires_in,
  token_type: session.token_type,
  user: session.user,
});
const cookieValue = `base64-${Buffer.from(sessionPayload, "utf8")
  .toString("base64")
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=+$/g, "")}`;

const headers = {
  cookie: `${cookieName}=${cookieValue}`,
  authorization: `Bearer ${session.access_token}`,
  "cache-control": "no-cache",
};

async function fetchText(url) {
  const res = await fetch(url, { headers });
  return { status: res.status, text: await res.text() };
}

const appPage = await fetchText(`${BASE}/app/mediktor`);
const navod = await fetchText(`${BASE}/mediktor/navod`);

const scriptHrefs = [
  ...appPage.text.matchAll(/\/_next\/static\/[^"'\\\s]+/g),
].map((m) => m[0]);
const unique = [...new Set(scriptHrefs)].slice(0, 40);

let bundle = appPage.text;
for (const href of unique) {
  const abs = href.startsWith("http") ? href : `${BASE}${href}`;
  try {
    const chunk = await fetch(abs, { headers: { "cache-control": "no-cache" } });
    if (chunk.ok) bundle += await chunk.text();
  } catch {
    // ignore missing chunk
  }
}

const hasWordLabel =
  /["'>]Word["'<]/.test(bundle) ||
  bundle.includes("sr-only") && bundle.includes("Word") ||
  /children:\s*"Word"/.test(bundle) ||
  bundle.includes('"Word"') ||
  bundle.includes("'Word'");
const hasPdfLabel = /["'>]PDF["'<]/.test(bundle) || bundle.includes('"PDF"') || bundle.includes("'PDF'");
const hasTiskLabel = bundle.includes("Tisk") || navod.text.includes("Tisk");
const hasOldDocButton =
  /children:\s*"\.doc"/.test(bundle) ||
  /["'>]\.doc["'<]/.test(bundle) ||
  bundle.includes('">.doc<') ||
  /sr-only">\.doc/.test(bundle);
const guideHasWord = navod.text.includes("Tlačítko Word") || bundle.includes("Tlačítko Word");
const guideHasOldDoc = navod.text.includes("Tlačítko .doc") || bundle.includes("Tlačítko .doc");
const copyHasWord =
  navod.text.includes("Tlačítko Kopírovat, Word") ||
  bundle.includes("Tlačítko Kopírovat, Word") ||
  bundle.includes("Word nebo PDF do vašeho software");

const ok =
  hasWordLabel &&
  hasPdfLabel &&
  hasTiskLabel &&
  !hasOldDocButton &&
  !guideHasOldDoc &&
  (guideHasWord || copyHasWord);

console.log(
  JSON.stringify(
    {
      ok,
      passwordVariant,
      appStatus: appPage.status,
      navodStatus: navod.status,
      chunkCount: unique.length,
      labels: {
        word: hasWordLabel,
        pdf: hasPdfLabel,
        tisk: hasTiskLabel,
        oldDocButton: hasOldDocButton,
        guideWord: guideHasWord,
        guideOldDoc: guideHasOldDoc,
        onboardingWord: copyHasWord,
      },
    },
    null,
    2
  )
);
process.exit(ok ? 0 : 1);
