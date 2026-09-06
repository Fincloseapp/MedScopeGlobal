/**
 * Live GDPR probe: anon PostgREST must not read or write OrdiZapis transcripts.
 * Uses the public anon key from medscopeglobal.com (never prints the key).
 *
 *   node scripts/probe-ordizapis-rls.mjs
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://medscopeglobal.com";

function redactJwt(text) {
  return String(text).replace(/eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/g, "<JWT>");
}

const html = await (await fetch(SITE, { headers: { "User-Agent": "MedScope-RLS-Audit/1.0" } })).text();
const m = html.match(/__MEDSCOPE_PUBLIC__=(\{.*?\})/);
if (!m) {
  console.error("No public Supabase env on", SITE);
  process.exit(1);
}
const env = JSON.parse(m[1].replaceAll('\\"', '"'));
const url = String(env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const anon = String(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
if (!url || !anon) {
  console.error("Public env missing URL or anon key");
  process.exit(1);
}

async function rest(path, { method = "GET", body } = {}) {
  const headers = {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
    Accept: "application/json",
    Prefer: "count=exact",
    "User-Agent": "MedScope-RLS-Audit/1.0",
  };
  let payload;
  if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${url}${path}`, { method, headers, body: payload });
  const text = await res.text();
  return { status: res.status, text, range: res.headers.get("content-range") };
}

const select = await rest("/rest/v1/dokumentace_notes?select=id");
let rows = null;
try {
  rows = JSON.parse(select.text);
} catch {
  rows = null;
}
const insert = await rest("/rest/v1/dokumentace_notes", {
  method: "POST",
  body: {
    user_id: "00000000-0000-0000-0000-000000000000",
    note: "rls-probe-must-fail",
    transcript: "rls-probe-must-fail",
  },
});

const selectOk =
  select.status === 200
    ? Array.isArray(rows) && rows.length === 0
    : select.status === 401 || select.status === 403;
const insertDenied = insert.status === 401 || insert.status === 403 || /row-level security/i.test(insert.text);

console.log("dokumentace_notes anon SELECT", select.status, "content-range", select.range, selectOk ? "OK" : "FAIL");
console.log(
  "dokumentace_notes anon INSERT",
  insert.status,
  insertDenied ? "OK (denied)" : "FAIL",
  redactJwt(insert.text).slice(0, 160)
);

if (!selectOk || !insertDenied) {
  console.error("FATAL: anon could read or write OrdiZapis transcripts");
  process.exit(1);
}
console.log("✓ live anon cannot read or write dokumentace_notes (RLS holds)");
