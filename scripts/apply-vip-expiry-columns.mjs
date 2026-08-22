#!/usr/bin/env node
/**
 * Adds vip_subscriptions.starts_at / ends_at if missing, then keeps TestD VIP
 * (active=true, ends_at null). Does not print secrets or passwords.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadProjectEnv } from "./load-env.mjs";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMAIL = "testd@medscopeglobal.com";
const SQL = fs.readFileSync(
  path.join(ROOT, "supabase/migrations/20260816180000_vip_subscription_expiry.sql"),
  "utf8"
);
const env = { ...loadProjectEnv(ROOT), ...process.env };

function projectRef() {
  if (env.SUPABASE_PROJECT_REF) return env.SUPABASE_PROJECT_REF;
  const m = String(env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)/);
  return m?.[1] ?? null;
}

async function tokenFromFile() {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  for (const p of [
    path.join(home, ".supabase", "access-token"),
    path.join(home, ".config", "supabase", "access-token"),
  ]) {
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8").trim();
  }
  return null;
}

async function applyViaManagementApi() {
  const ref = projectRef();
  const token = env.SUPABASE_ACCESS_TOKEN || (await tokenFromFile());
  if (!ref || !token) return { ok: false, method: "management_api", reason: "missing_token_or_ref" };
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
    return { ok: false, method: "management_api", reason: `api_${res.status}`, detail: text.slice(0, 180) };
  }
  return { ok: true, method: "management_api" };
}

async function applyViaPostgres() {
  const url = env.DIRECT_URL || env.SUPABASE_DB_URL || env.DATABASE_URL;
  if (!url) return { ok: false, method: "postgres", reason: "missing_database_url" };
  let pg;
  try {
    pg = await import("pg");
  } catch {
    return { ok: false, method: "postgres", reason: "pg_not_installed" };
  }
  const client = new pg.default.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(SQL);
    return { ok: true, method: "postgres" };
  } finally {
    await client.end();
  }
}

const management = await applyViaManagementApi();
const applied = management.ok ? management : await applyViaPostgres();

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: profile, error: pErr } = await admin
  .from("users")
  .select("id,access_level,role")
  .ilike("email", EMAIL)
  .maybeSingle();
if (pErr) throw new Error(pErr.message);

let testd = null;
if (profile?.id) {
  const withExpiry = {
    active: true,
    starts_at: new Date().toISOString(),
    ends_at: null,
  };
  let { error: uErr } = await admin
    .from("vip_subscriptions")
    .update(withExpiry)
    .eq("user_id", profile.id);
  if (uErr) {
    ({ error: uErr } = await admin
      .from("vip_subscriptions")
      .update({ active: true })
      .eq("user_id", profile.id));
  }
  if (uErr) throw new Error(uErr.message);

  const { data: vip, error: vErr } = await admin
    .from("vip_subscriptions")
    .select("active,starts_at,ends_at")
    .eq("user_id", profile.id)
    .maybeSingle();
  testd = {
    access_level: profile.access_level,
    role: profile.role,
    vipActive: Boolean(vip?.active),
    hasStartsAtColumn: !vErr && vip != null && "starts_at" in (vip ?? {}),
    hasEndsAtColumn: !vErr && vip != null && "ends_at" in (vip ?? {}),
    endsAtIsNull: vip ? vip.ends_at == null : null,
    selectError: vErr?.message ?? null,
  };
}

console.log(
  JSON.stringify(
    {
      ddl: { ok: applied.ok, method: applied.method, reason: applied.reason ?? null },
      testd,
    },
    null,
    2
  )
);
if (!applied.ok) process.exit(1);
