import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getClientIp } from "@/lib/security/client-ip";
import { verifyTurnstileToken } from "@/lib/security/captcha";
import {
  checkRegistrationThrottle,
  recordRegistrationEvent,
} from "@/lib/security/bruteforce";
import {
  checkEmailDomainAllowed,
  extractEmailDomain,
  isDisposableEmail,
} from "@/lib/security/disposable-email";
import { withApiGuard } from "@/lib/security/api-guard";
import { logSecurityEvent } from "@/lib/security/security-log";
import { sanitizeText } from "@/lib/security/sanitize";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(256),
  fullName: z.string().min(1).max(200),
  accessLevel: z.string().optional(),
  profession: z.string().optional(),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: true,
    action: "auth_signup",
  });
  if (!guard.ok) return guard.response;

  const ip = getClientIp(request);

  let body: z.infer<typeof signupSchema>;
  try {
    body = signupSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const email = sanitizeText(body.email.toLowerCase(), 320);
  const fullName = sanitizeText(body.fullName, 200);

  if (isDisposableEmail(email)) {
    await logSecurityEvent({
      ip,
      action: "auth_signup:disposable_email",
      status: "blocked",
      details: { domain: extractEmailDomain(email) },
    });
    return NextResponse.json(
      { error: "Disposable email addresses are not allowed." },
      { status: 403 }
    );
  }

  const domainCheck = await checkEmailDomainAllowed(email, async (domain) => {
    try {
      const admin = createServiceRoleClient();
      const { data } = await admin
        .from("email_domain_rules")
        .select("rule")
        .eq("domain", domain)
        .maybeSingle();
      return (data?.rule as "allow" | "deny") ?? null;
    } catch {
      return null;
    }
  });

  if (!domainCheck.allowed) {
    await logSecurityEvent({
      ip,
      action: "auth_signup:domain_blocked",
      status: "blocked",
      details: { reason: domainCheck.reason },
    });
    return NextResponse.json({ error: "Email domain not allowed." }, { status: 403 });
  }

  const throttle = await checkRegistrationThrottle(ip);
  if (!throttle.allowed) {
    return NextResponse.json(
      { error: "Too many registrations from this IP. Try again later." },
      { status: 429 }
    );
  }

  const captcha = await verifyTurnstileToken(body.captchaToken ?? "", ip);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 403 });
  }

  const supabase = await createClient();
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { data, error } = await supabase.auth.signUp({
    email,
    password: body.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
      data: {
        full_name: fullName,
        access_level: body.accessLevel ?? "public",
        profession: body.profession ?? "general_public",
      },
    },
  });

  if (error) {
    await logSecurityEvent({
      ip,
      action: "auth_signup:failed",
      status: "error",
      details: { message: error.message },
    });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await recordRegistrationEvent(ip, email);
  await logSecurityEvent({
    ip,
    userId: data.user?.id,
    action: "auth_signup:success",
    status: "ok",
  });

  return NextResponse.json({
    ok: true,
    needsConfirmation: !data.session,
    userId: data.user?.id,
  });
}
