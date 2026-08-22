import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient, tryCreateServiceRoleClient } from "@/lib/supabase/service";

export type MeDiprepSessionUser = {
  id: string;
  email: string;
  created: boolean;
};

async function findAuthUserByEmail(
  admin: ReturnType<typeof createServiceRoleClient>,
  email: string
): Promise<{ id: string; email?: string; user_metadata?: Record<string, unknown> } | null> {
  const normalized = email.trim().toLowerCase();
  const { data: profile } = await admin.from("users").select("id, email").eq("email", normalized).maybeSingle();
  if (profile?.id) {
    const byId = await admin.auth.admin.getUserById(profile.id);
    if (byId.data?.user) return byId.data.user;
  }

  const anyAdmin = admin.auth.admin as unknown as {
    getUserByEmail?: (email: string) => Promise<{
      data: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null };
      error: unknown;
    }>;
  };
  if (typeof anyAdmin.getUserByEmail === "function") {
    const { data, error } = await anyAdmin.getUserByEmail(normalized);
    if (!error && data?.user) return data.user;
  }

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const hit = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (hit) return { id: hit.id, email: hit.email, user_metadata: hit.user_metadata as Record<string, unknown> };
    if (!data.users.length || data.users.length < 200) break;
  }
  return null;
}

function isPhysician(meta?: Record<string, unknown> | null) {
  return meta?.profession === "physician" || meta?.mediktor === true || meta?.access_level === "physician";
}

async function upsertStudentProfile(opts: { userId: string; email: string; keepPhysician: boolean }) {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  const base = {
    id: opts.userId,
    email: opts.email,
    full_name: opts.email.split("@")[0] || "Student",
    role: "user",
    access_level: opts.keepPhysician ? "physician" : "student",
    profession: opts.keepPhysician ? "physician" : "student",
  };
  await admin.from("users").upsert(base, { onConflict: "id" });
}

/** Passwordless session for MeDiprep (students). Does not overwrite a physician account. */
export async function establishMeDiprepSession(opts: {
  email: string;
}): Promise<{ ok: true; user: MeDiprepSessionUser } | { ok: false; error: string; status: number }> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { ok: false, error: "Služba dočasně nedostupná.", status: 503 };
  }

  const email = opts.email.trim().toLowerCase();
  let created = false;
  let user = await findAuthUserByEmail(admin, email);
  const keepPhysician = isPhysician(user?.user_metadata);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        access_level: "student",
        profession: "student",
        mediprep: true,
      },
    });
    if (error || !data.user) {
      user = await findAuthUserByEmail(admin, email);
      if (!user) {
        return { ok: false, error: error?.message || "Nepodařilo se vytvořit účet.", status: 500 };
      }
    } else {
      user = { id: data.user.id, email: data.user.email ?? email };
      created = true;
    }
  }

  await upsertStudentProfile({ userId: user.id, email, keepPhysician });

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      data: keepPhysician
        ? { mediprep: true }
        : { access_level: "student", profession: "student", mediprep: true },
    },
  });
  if (linkError) {
    return { ok: false, error: linkError.message || "Nepodařilo se vytvořit relaci.", status: 500 };
  }

  const tokenHash =
    (linkData as { properties?: { hashed_token?: string } })?.properties?.hashed_token || null;
  if (!tokenHash) {
    return { ok: false, error: "Chybí přihlašovací token.", status: 500 };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Auth není nakonfigurovaná.", status: 503 };
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });
  if (verifyError) {
    const retry = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
    if (retry.error) {
      return { ok: false, error: verifyError.message || "Přihlášení selhalo.", status: 500 };
    }
  }

  return { ok: true, user: { id: user.id, email, created } };
}

export async function getMeDiprepSession(): Promise<{
  authenticated: boolean;
  email: string | null;
  userId: string | null;
}> {
  const supabase = await createClient();
  if (!supabase) return { authenticated: false, email: null, userId: null };
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { authenticated: false, email: null, userId: null };
  return { authenticated: true, email: user.email ?? null, userId: user.id };
}
