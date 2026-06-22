import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClientIp, getRequestFingerprint } from "@/lib/security/client-ip";
import { verifyTurnstileToken } from "@/lib/security/captcha";
import {
  isLoginLockedOut,
  recordLoginAttempt,
} from "@/lib/security/bruteforce";
import { withApiGuard } from "@/lib/security/api-guard";
import { logSecurityEvent } from "@/lib/security/security-log";
import { sanitizeText } from "@/lib/security/sanitize";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: true,
    action: "auth_login",
  });
  if (!guard.ok) return guard.response;

  const ip = getClientIp(request);
  const fingerprint = getRequestFingerprint(request);

  let body: z.infer<typeof loginSchema>;
  try {
    const raw = await request.json();
    body = loginSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const email = sanitizeText(body.email.toLowerCase(), 320);

  const lockout = await isLoginLockedOut(ip, email);
  if (lockout.locked) {
    await logSecurityEvent({
      ip,
      action: "auth_login:lockout",
      status: "blocked",
      details: { email },
    });
    return NextResponse.json(
      {
        error: "Too many failed attempts. Try again in 15 minutes.",
        retryAfter: lockout.retryAfterSec,
      },
      { status: 429 }
    );
  }

  const captcha = await verifyTurnstileToken(body.captchaToken ?? "", ip);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: body.password,
  });

  if (error) {
    await recordLoginAttempt({ ip, email, fingerprint, success: false });
    await logSecurityEvent({
      ip,
      action: "auth_login:failed",
      status: "warning",
      details: { email, message: error.message },
    });
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  await recordLoginAttempt({ ip, email, fingerprint, success: true });
  await logSecurityEvent({
    ip,
    userId: data.user?.id,
    action: "auth_login:success",
    status: "ok",
  });

  return NextResponse.json({ ok: true, user: { id: data.user?.id, email } });
}
