import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient, tryCreateServiceRoleClient } from "@/lib/supabase/service";

export type MediktorSessionUser = {
  id: string;
  email: string;
  phone?: string | null;
  created: boolean;
};

function phoneAliasEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `mediktor.${digits}@otp.medscopeglobal.com`;
}

async function findAuthUserByEmail(
  admin: ReturnType<typeof createServiceRoleClient>,
  email: string
): Promise<{ id: string; email?: string } | null> {
  // listUsers is paginated; prefer getUserByEmail when available
  const anyAdmin = admin.auth.admin as unknown as {
    getUserByEmail?: (email: string) => Promise<{
      data: { user: { id: string; email?: string } | null };
      error: unknown;
    }>;
  };
  if (typeof anyAdmin.getUserByEmail === "function") {
    const { data, error } = await anyAdmin.getUserByEmail(email);
    if (!error && data?.user) return data.user;
  }

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) return null;
  const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return hit ? { id: hit.id, email: hit.email } : null;
}

async function upsertMediktorProfile(opts: {
  userId: string;
  email: string;
  phone?: string | null;
}) {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;

  const base = {
    id: opts.userId,
    email: opts.email,
    full_name: opts.email.split("@")[0] || "Lékař",
    role: "user",
    access_level: "physician",
    profession: "physician",
    verification_status: "pending",
  };

  const full = {
    ...base,
    phone: opts.phone ?? null,
    mediktor_onboarding_completed: false,
    mediktor_verification_status: "pending",
  };

  const { error } = await admin.from("users").upsert(full, { onConflict: "id" });
  if (error) {
    await admin.from("users").upsert(base, { onConflict: "id" });
  }
}

/**
 * After OTP success: ensure Auth + public.users rows exist and set SSR session cookies.
 */
export async function establishMediktorSession(opts: {
  email?: string | null;
  phone?: string | null;
}): Promise<
  | { ok: true; user: MediktorSessionUser }
  | { ok: false; error: string; status: number }
> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { ok: false, error: "Služba dočasně nedostupná.", status: 503 };
  }

  const email =
    (opts.email?.trim().toLowerCase() || null) ??
    (opts.phone ? phoneAliasEmail(opts.phone) : null);
  if (!email) {
    return { ok: false, error: "Chybí e-mail nebo telefon.", status: 400 };
  }

  let created = false;
  let user = await findAuthUserByEmail(admin, email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      phone: opts.phone ?? undefined,
      user_metadata: {
        access_level: "physician",
        profession: "physician",
        mediktor: true,
        phone: opts.phone ?? null,
      },
    });
    if (error || !data.user) {
      // Race: user created concurrently
      user = await findAuthUserByEmail(admin, email);
      if (!user) {
        return {
          ok: false,
          error: error?.message || "Nepodařilo se vytvořit účet.",
          status: 500,
        };
      }
    } else {
      user = { id: data.user.id, email: data.user.email ?? email };
      created = true;
    }
  }

  await upsertMediktorProfile({
    userId: user.id,
    email,
    phone: opts.phone ?? null,
  });

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      data: {
        access_level: "physician",
        profession: "physician",
        mediktor: true,
      },
    },
  });

  if (linkError) {
    return {
      ok: false,
      error: linkError.message || "Nepodařilo se vytvořit relaci.",
      status: 500,
    };
  }

  const tokenHash =
    (linkData as { properties?: { hashed_token?: string } })?.properties?.hashed_token ||
    null;

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
    // Fallback type used by some Supabase versions
    const retry = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: tokenHash,
    });
    if (retry.error) {
      return {
        ok: false,
        error: verifyError.message || "Přihlášení selhalo.",
        status: 500,
      };
    }
  }

  return {
    ok: true,
    user: { id: user.id, email, phone: opts.phone ?? null, created },
  };
}

export async function markOnboardingCompleted(userId: string): Promise<void> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  const { error } = await admin
    .from("users")
    .update({ mediktor_onboarding_completed: true })
    .eq("id", userId);
  if (error) {
    // Column may be missing until migration; ignore — localStorage still gates UI
    console.warn("[mediktor] onboarding flag update skipped", error.message);
  }
}
