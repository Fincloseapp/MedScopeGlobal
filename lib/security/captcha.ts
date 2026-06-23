/** Cloudflare Turnstile verification (server-side). */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev mode — skip if not configured
    if (process.env.NODE_ENV === "development") {
      return { ok: true };
    }
    return { ok: false, error: "CAPTCHA not configured" };
  }

  if (!token) {
    return { ok: false, error: "Missing CAPTCHA token" };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }
  );

  const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
  if (!data.success) {
    return {
      ok: false,
      error: data["error-codes"]?.join(", ") ?? "CAPTCHA verification failed",
    };
  }

  return { ok: true };
}

export function getTurnstileSiteKey(): string | null {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
}
