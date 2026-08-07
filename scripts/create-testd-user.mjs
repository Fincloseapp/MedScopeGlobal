import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMAIL = "testd@medscopeglobal.com";
const PASSWORD = "David";
const DISPLAY = "TestD";

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  const env = {};
  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing .env.local at ${envPath}`);
  }
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    let key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
  return env;
}

function isMissingColumnError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  const code = String(err?.code || "");
  return (
    code === "PGRST204" ||
    code === "42703" ||
    (msg.includes("column") &&
      (msg.includes("does not exist") || msg.includes("schema cache")))
  );
}

async function upsertUsersRow(admin, userId) {
  const full = {
    id: userId,
    email: EMAIL,
    full_name: DISPLAY,
    role: "admin",
    access_level: "physician",
    verification_status: "approved",
    verified_doctor: true,
  };

  let { error } = await admin.from("users").upsert(full, { onConflict: "id" });
  if (!error) return { mode: "full", verified_doctor: true };

  if (!isMissingColumnError(error)) {
    throw new Error(`users upsert (full) failed: ${error.message}`);
  }

  const withoutDoctor = { ...full };
  delete withoutDoctor.verified_doctor;
  ({ error } = await admin.from("users").upsert(withoutDoctor, { onConflict: "id" }));
  if (!error) return { mode: "magazine", verified_doctor: false };

  if (!isMissingColumnError(error)) {
    throw new Error(`users upsert (magazine) failed: ${error.message}`);
  }

  const minimal = {
    id: userId,
    email: EMAIL,
    full_name: DISPLAY,
    role: "admin",
  };
  ({ error } = await admin.from("users").upsert(minimal, { onConflict: "id" }));
  if (error) throw new Error(`users upsert (minimal) failed: ${error.message}`);
  return { mode: "minimal", verified_doctor: false };
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let userId = null;
  let page = 1;
  const perPage = 200;
  while (!userId && page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const found = (data?.users || []).find(
      (u) => (u.email || "").toLowerCase() === EMAIL.toLowerCase()
    );
    if (found) {
      userId = found.id;
      break;
    }
    if (!data?.users?.length || data.users.length < perPage) break;
    page += 1;
  }

  const meta = {
    full_name: DISPLAY,
    display_name: DISPLAY,
    name: DISPLAY,
  };
  let passwordSet = true;
  let passwordError = null;

  if (userId) {
    let { data, error } = await admin.auth.admin.updateUserById(userId, {
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: meta,
    });
    if (error && /password/i.test(error.message)) {
      passwordSet = false;
      passwordError = error.message;
      ({ data, error } = await admin.auth.admin.updateUserById(userId, {
        email: EMAIL,
        email_confirm: true,
        user_metadata: meta,
      }));
    }
    if (error) throw new Error(`updateUserById failed: ${error.message}`);
    userId = data.user.id;
  } else {
    let { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: meta,
    });
    if (error && /password/i.test(error.message)) {
      // Project password policy rejects "David" (< 6 chars). Create with temp then report.
      passwordSet = false;
      passwordError = error.message;
      const temp = PASSWORD + "0";
      ({ data, error } = await admin.auth.admin.createUser({
        email: EMAIL,
        password: temp,
        email_confirm: true,
        user_metadata: meta,
      }));
    }
    if (error) throw new Error(`createUser failed: ${error.message}`);
    userId = data.user.id;
  }

  const usersResult = await upsertUsersRow(admin, userId);

  if (!usersResult.verified_doctor) {
    const { error: vdErr } = await admin
      .from("users")
      .update({ verified_doctor: true })
      .eq("id", userId);
    if (!vdErr) usersResult.verified_doctor = true;
    else if (!isMissingColumnError(vdErr)) {
      console.error("verified_doctor update warning:", vdErr.message);
    }
  }

  async function upsertVip() {
    const payloads = [
      {
        user_id: userId,
        active: true,
        starts_at: new Date().toISOString(),
        ends_at: null,
      },
      { user_id: userId, active: true, starts_at: new Date().toISOString() },
      { user_id: userId, active: true },
    ];

    const { data: existing, error: selErr } = await admin
      .from("vip_subscriptions")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (selErr && !/multiple/i.test(selErr.message)) {
      // continue; table may still allow insert/update
    }

    for (const payload of payloads) {
      if (existing?.user_id) {
        const { error } = await admin
          .from("vip_subscriptions")
          .update(payload)
          .eq("user_id", userId);
        if (!error) return;
        if (!isMissingColumnError(error) && !/ends_at|starts_at|column/i.test(error.message)) {
          throw new Error(`vip_subscriptions update failed: ${error.message}`);
        }
      } else {
        const { error } = await admin.from("vip_subscriptions").insert(payload);
        if (!error) return;
        if (/duplicate|unique|already/i.test(error.message)) {
          const { error: uErr } = await admin
            .from("vip_subscriptions")
            .update(payload)
            .eq("user_id", userId);
          if (!uErr) return;
          if (!isMissingColumnError(uErr)) {
            throw new Error(`vip_subscriptions update-after-dup failed: ${uErr.message}`);
          }
          continue;
        }
        if (!isMissingColumnError(error) && !/ends_at|starts_at|column/i.test(error.message)) {
          throw new Error(`vip_subscriptions insert failed: ${error.message}`);
        }
      }
    }
    throw new Error("vip_subscriptions upsert failed after fallbacks");
  }

  await upsertVip();

  console.log(
    JSON.stringify(
      {
        email: EMAIL,
        password: PASSWORD,
        userId,
        passwordSet,
        passwordError,
        usersUpsertMode: usersResult.mode,
        verified_doctor: usersResult.verified_doctor,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  process.exit(1);
});