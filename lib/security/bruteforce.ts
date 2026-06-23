import { createServiceRoleClient } from "@/lib/supabase/service";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export async function recordLoginAttempt(params: {
  ip: string;
  email?: string;
  fingerprint?: string;
  success: boolean;
}) {
  try {
    const admin = createServiceRoleClient();
    await admin.from("login_attempts").insert({
      ip: params.ip,
      email: params.email ?? null,
      fingerprint: params.fingerprint ?? null,
      success: params.success,
    });
  } catch (e) {
    console.error("recordLoginAttempt failed", e);
  }
}

export async function isLoginLockedOut(
  ip: string,
  email?: string
): Promise<{ locked: boolean; retryAfterSec?: number }> {
  try {
    const admin = createServiceRoleClient();
    const since = new Date(Date.now() - LOCKOUT_MS).toISOString();

    let query = admin
      .from("login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("success", false)
      .gte("created_at", since);

    if (email) {
      query = query.or(`ip.eq.${ip},email.eq.${email}`);
    } else {
      query = query.eq("ip", ip);
    }

    const { count } = await query;
    const failures = count ?? 0;

    if (failures >= MAX_ATTEMPTS) {
      return { locked: true, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000) };
    }

    return { locked: false };
  } catch {
    return { locked: false };
  }
}

export async function checkRegistrationThrottle(
  ip: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const admin = createServiceRoleClient();
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count } = await admin
      .from("registration_events")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);

    if ((count ?? 0) >= 3) {
      return { allowed: false, reason: "registration_throttled" };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export async function recordRegistrationEvent(ip: string, email: string) {
  try {
    const admin = createServiceRoleClient();
    const domain = email.includes("@") ? email.split("@")[1]?.toLowerCase() : null;
    await admin.from("registration_events").insert({
      ip,
      email_domain: domain,
    });
  } catch (e) {
    console.error("recordRegistrationEvent failed", e);
  }
}
