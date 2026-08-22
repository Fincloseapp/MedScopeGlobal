#!/usr/bin/env node
/**
 * Live-check MeDiktor anamnesis structure as TestD.
 * Does not print passwords or clinical note bodies.
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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) throw new Error("Missing Supabase public credentials");

const NEEDLES = [
  "Identifikační údaje",
  "(NO — nynější onemocnění)",
  "Osobní anamnéza (OA)",
  "Rodinná anamnéza (RA)",
  "Farmakologická anamnéza (FA)",
  "(AA — alergologická anamnéza)",
  "(TA — toxikologická / abúzus)",
  "(PA / SA)",
  "GDPR",
];

async function fetchRetry(pathname, headers) {
  let last = { status: 0, text: "" };
  for (let i = 0; i < 4; i++) {
    const res = await fetch(`${BASE}${pathname}`, {
      headers: { "cache-control": "no-cache", ...headers },
    });
    last = { status: res.status, text: await res.text() };
    if (res.status !== 503) return last;
    await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
  }
  return last;
}

const auth = createClient(url, anon, { auth: { persistSession: false } });
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
  console.log(JSON.stringify({ ok: false, reason: "testd_sign_in_failed" }, null, 2));
  process.exit(1);
}

const projectRef = new URL(url).hostname.split(".")[0];
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
const cookieHeader = `${cookieName}=${cookieValue}`;

const appPage = await fetchRetry("/app/mediktor", { cookie: cookieHeader });
const mediktor = await fetchRetry("/mediktor", {});
const notesRes = await fetch(`${BASE}/api/lekari/dokumentace/notes?limit=20`, {
  headers: {
    cookie: cookieHeader,
    authorization: `Bearer ${session.access_token}`,
    "cache-control": "no-cache",
  },
});
const notesJson = notesRes.ok ? await notesRes.json() : { error: await notesRes.text() };
const notes = notesJson.notes ?? [];

const noteChecks = notes.map((n) => {
  const text = String(n.note || "");
  const title = String(n.title || "");
  return {
    idPrefix: String(n.id || "").slice(0, 8),
    template: n.template_id,
    titlePrefix: title.replace(/\s+/g, " ").slice(0, 48),
    titleHasBrace: title.includes("{"),
    markers: Object.fromEntries(NEEDLES.map((k) => [k, text.includes(k)])),
    hasJson: text.includes("MEDIKTOR_ANAMNESIS_JSON_V1"),
    canonicalCount: NEEDLES.filter((k) => text.includes(k)).length,
  };
});

const SAMPLE =
  "Nynější potíže: bolest hlavy tři dny. Osobní anamnéza: hypertenze. " +
  "Rodinná anamnéza: otec infarkt v osmačtyřiceti. Farmakologická anamnéza: Agen 5 mg 1-0-0. " +
  "Alergie na penicilin. Nekuřák, alkohol příležitostně, káva dvakrát denně. " +
  "Pracuje jako účetní, sedavá práce.";

const structRes = await fetch(`${BASE}/api/lekari/dokumentace/structure`, {
  method: "POST",
  headers: {
    cookie: cookieHeader,
    authorization: `Bearer ${session.access_token}`,
    "content-type": "application/json",
    "cache-control": "no-cache",
    "x-dokumentace-source": "live-verify",
  },
  body: JSON.stringify({
    transcript: SAMPLE,
    mode: "dictation",
    templateId: "anamneza",
    source: "live-verify",
  }),
});
const structText = await structRes.text();
let structJson = {};
try {
  structJson = JSON.parse(structText);
} catch {
  structJson = { parseError: true, detail: structText.slice(0, 200) };
}
const structuredNote = String(structJson.note || "");
const structureMarkers = Object.fromEntries(
  NEEDLES.map((k) => [k, structuredNote.includes(k)])
);

const appHasForm =
  appPage.text.includes("Anamnestický dotazník") ||
  appPage.text.includes("Nynější potíže") ||
  appPage.text.includes("anamneza");

const titlesOk = noteChecks.every((n) => !n.titleHasBrace);
const historieOk =
  notesRes.ok &&
  noteChecks.filter((n) => n.template === "anamneza").length >= 4 &&
  noteChecks.filter((n) => n.template === "anamneza").every((n) => n.canonicalCount >= 7);

console.log(
  JSON.stringify(
    {
      ok: historieOk && titlesOk && appPage.status === 200,
      passwordVariant,
      pages: {
        mediktor: mediktor.status,
        appDokumentace: appPage.status,
        appHasAnamnesisHint: appHasForm,
      },
      notesApi: notesRes.status,
      noteCount: notes.length,
      titlesHaveBrace: noteChecks.filter((n) => n.titleHasBrace).length,
      remappedWithHeadings: noteChecks.filter((n) => n.canonicalCount >= 7).length,
      noteChecks,
      structurePost: {
        status: structRes.status,
        saved: Boolean(structJson.saved),
        markerHits: Object.values(structureMarkers).filter(Boolean).length,
        structureMarkers,
        hasJson: structuredNote.includes("MEDIKTOR_ANAMNESIS_JSON_V1"),
        error: structJson.error || null,
      },
    },
    null,
    2
  )
);
