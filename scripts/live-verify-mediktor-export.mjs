#!/usr/bin/env node
/**
 * Live TestD note → generate Word/PDF bytes. No passwords, no note bodies.
 * Run: npx tsx scripts/live-verify-mediktor-export.mjs
 */
import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";
import { loadProjectEnv } from "./load-env.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  looksLikeAnamnesisNote,
  parseAnamnesisFromNote,
} from "../lib/lekari/dokumentace/anamnesis.ts";
import {
  buildMediktorDocxBytes,
  buildMediktorPdfBytes,
  exportPlainLines,
  looksLikeDocx,
  looksLikePdf,
} from "../lib/lekari/dokumentace/mediktor-files.ts";

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

const notesRes = await fetch(`${BASE}/api/lekari/dokumentace/notes?limit=20`, {
  headers: {
    cookie: `${cookieName}=${cookieValue}`,
    authorization: `Bearer ${session.access_token}`,
    "cache-control": "no-cache",
  },
});
const notesJson = notesRes.ok ? await notesRes.json() : { error: await notesRes.text() };
const notes = notesJson.notes ?? [];
const anam = notes.filter((n) => n.template_id === "anamneza" || looksLikeAnamnesisNote(n.note, n.template_id));
const sample = anam[0];
if (!sample?.note) {
  console.log(
    JSON.stringify({
      ok: false,
      reason: "no_testd_anamnesis_note",
      notesApi: notesRes.status,
      noteCount: notes.length,
      passwordVariant,
    })
  );
  process.exit(1);
}

const title = "Anamnestický dotazník pro dospělé pacienty";
const lines = exportPlainLines(sample.note, title);
const docx = await buildMediktorDocxBytes(sample.note, title);
const pdf = await buildMediktorPdfBytes(sample.note, title);
const zip = await JSZip.loadAsync(docx);
const documentXml = (await zip.file("word/document.xml")?.async("string")) || "";
const pdfText = Buffer.from(pdf).toString("latin1");
const record = parseAnamnesisFromNote(sample.note);

const pageHtml = await fetch(`${BASE}/app/mediktor`, {
  headers: {
    cookie: `${cookieName}=${cookieValue}`,
    authorization: `Bearer ${session.access_token}`,
    "cache-control": "no-cache",
  },
}).then((r) => r.text());

console.log(
  JSON.stringify(
    {
      ok:
        notesRes.ok &&
        docx.byteLength > 64 &&
        pdf.byteLength > 64 &&
        looksLikeDocx(docx) &&
        looksLikePdf(pdf) &&
        documentXml.includes("w:document") &&
        documentXml.includes("w:tbl") &&
        lines.some((l) => l.includes("1. Identifikační")) &&
        lines.some((l) => l.includes("10. Prohlášení")) &&
        lines.some((l) => l.includes("ke kontrole lékařem")) &&
        !lines.join("\n").includes("chronicé"),
      passwordVariant,
      notesApi: notesRes.status,
      noteCount: notes.length,
      anamnesisCount: anam.length,
      sampleIdPrefix: String(sample.id).slice(0, 8),
      sampleTitle: String(sample.title || "").slice(0, 48),
      titlesHaveBrace: notes.filter((n) => String(n.title || "").includes("{")).length,
      sex: record?.identification?.sex || "",
      export: {
        docxBytes: docx.byteLength,
        pdfBytes: pdf.byteLength,
        docxPk: looksLikeDocx(docx),
        pdfHeader: looksLikePdf(pdf),
        docxHasDocumentXml: Boolean(zip.file("word/document.xml")),
        docxHasIdent: documentXml.includes("Identifika"),
        pdfHasIdent: pdfText.includes("Identifika"),
        pdfEof: pdfText.includes("%%EOF"),
        numbered1: lines.some((l) => l.includes("1. Identifikační")),
        numbered10: lines.some((l) => l.includes("10. Prohlášení")),
        headingGdpr: lines.some((l) => l.includes("souhlas se zpracováním údajů (GDPR)")),
        kickerPhysician: lines.some((l) => l.includes("ke kontrole lékařem")),
        noChronicTypo: !lines.join("\n").includes("chronicé") && !documentXml.includes("chronicé"),
        docxTable: documentXml.includes("w:tbl"),
        pdfPageNo: pdfText.includes("Strana"),
        hasJsonLeak:
          documentXml.includes("MEDIKTOR_ANAMNESIS_JSON") || pdfText.includes("MEDIKTOR_ANAMNESIS_JSON"),
      },
      liveUi: {
        statusHint: pageHtml.includes("dokumentace") || pageHtml.includes("MeDiktor"),
        hasPdfLabel: /PDF/.test(pageHtml),
        hasDocLabel: /\.doc/.test(pageHtml),
        hasTiskLabel: /Tisk/.test(pageHtml),
      },
    },
    null,
    2
  )
);
