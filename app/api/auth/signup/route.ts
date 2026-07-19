import { NextResponse } from "next/server";
import { z } from "zod";
import { sendSignupConfirmationEmail } from "@/lib/auth/send-signup-confirmation";
import { SITE } from "@/lib/config/site";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  checkRegistrationThrottle,
  recordRegistrationEvent,
} from "@/lib/security/bruteforce";
import { getClientIp } from "@/lib/security/client-ip";
import {
  checkEmailDomainAllowed,
  extractEmailDomain,
  isDisposableEmail,
} from "@/lib/security/disposable-email";
import { sanitizeText } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/security-log";
import { createServiceRoleClient } from "@/lib/supabase/service";

const signupSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(256),
  fullName: z.string().min(1).max(200),
  accessLevel: z.string().optional(),
  profession: z.string().optional(),
  captchaToken: z.string().optional(),
});

function siteOrigin(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const origin = request.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  return SITE.url.replace(/\/$/, "");
}

function captchaFullyConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  );
}

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: captchaFullyConfigured(),
    action: "auth_signup",
  });
  if (!guard.ok) return guard.response;

  const ip = getClientIp(request);

  let body: z.infer<typeof signupSchema>;
  try {
    body = signupSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatná data formuláře." }, { status: 400 });
  }

  const email = sanitizeText(body.email.toLowerCase(), 320);
  const fullName = sanitizeText(body.fullName, 200);
  const accessLevel =
    body.accessLevel === "physician" || body.accessLevel === "student"
      ? body.accessLevel
      : "public";
  const profession = sanitizeText(body.profession ?? "general_public", 80);

  if (isDisposableEmail(email)) {
    await logSecurityEvent({
      ip,
      action: "auth_signup:disposable_email",
      status: "blocked",
      details: { domain: extractEmailDomain(email) },
    });
    return NextResponse.json(
      { error: "Jednorázové e-mailové adresy nejsou povoleny." },
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
    return NextResponse.json(
      { error: "Tato e-mailová doména není povolena." },
      { status: 403 }
    );
  }

  const throttle = await checkRegistrationThrottle(ip);
  if (!throttle.allowed) {
    return NextResponse.json(
      { error: "Příliš mnoho registrací z této IP. Zkuste to později." },
      { status: 429 }
    );
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json(
      { error: "Auth server není nakonfigurován (service role)." },
      { status: 503 }
    );
  }

  const origin = siteOrigin(request);
  const redirectTo = `${origin}/auth/callback?next=/account`;
  const meta = {
    full_name: fullName,
    access_level: accessLevel,
    profession,
  };

  // 1) Create auth user (unconfirmed) — reliable vs cookie SSR client
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: body.password,
    email_confirm: false,
    user_metadata: meta,
  });

  let userId = created.user?.id ?? null;
  let alreadyExists = false;

  if (createErr) {
    const msg = (createErr.message || "").toLowerCase();
    alreadyExists =
      msg.includes("already") ||
      msg.includes("registered") ||
      msg.includes("exists") ||
      createErr.status === 422;

    if (!alreadyExists) {
      await logSecurityEvent({
        ip,
        action: "auth_signup:failed",
        status: "error",
        details: { message: createErr.message },
      });
      return NextResponse.json(
        { error: createErr.message || "Registrace se nezdařila." },
        { status: 400 }
      );
    }

    // Look up existing user for confirmed vs unconfirmed
    try {
      const { data: profile } = await admin
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (profile?.id) {
        userId = profile.id as string;
        const { data: authUser } = await admin.auth.admin.getUserById(userId);
        if (authUser.user?.email_confirmed_at) {
          return NextResponse.json(
            {
              error:
                "Účet s tímto e-mailem už existuje. Přihlaste se, nebo použijte obnovení hesla.",
              code: "ALREADY_REGISTERED",
            },
            { status: 409 }
          );
        }
      }
    } catch {
      /* continue — still try generateLink */
    }
  }

  // 2) Generate confirmation link (works for new + unconfirmed existing)
  const { data: linkData, error: linkErr } = alreadyExists
    ? await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo, data: meta },
      })
    : await admin.auth.admin.generateLink({
        type: "signup",
        email,
        password: body.password,
        options: { redirectTo, data: meta },
      });

  if (linkErr || !linkData?.properties?.action_link) {
    await logSecurityEvent({
      ip,
      userId: userId ?? undefined,
      action: "auth_signup:link_failed",
      status: "error",
      details: { message: linkErr?.message },
    });
    return NextResponse.json(
      {
        error:
          "Účet se nepodařilo připravit k ověření e-mailu. Zkuste to znovu nebo kontaktujte podporu.",
      },
      { status: 500 }
    );
  }

  const actionLink = linkData.properties.action_link as string;
  userId = userId ?? linkData.user?.id ?? null;

  // 3) Upsert public.users profile immediately
  if (userId) {
    await admin.from("users").upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role: "user",
        access_level: accessLevel,
        profession,
        verification_status: accessLevel === "physician" ? "pending" : "approved",
      },
      { onConflict: "id" }
    );
  }

  // 4) Send confirmation via app email providers (not only Supabase SMTP)
  const mailed = await sendSignupConfirmationEmail({
    to: email,
    fullName,
    actionLink,
    redirectTo,
  });

  if (!mailed.ok) {
    await logSecurityEvent({
      ip,
      userId: userId ?? undefined,
      action: "auth_signup:email_failed",
      status: "error",
      details: { error: mailed.error },
    });
    // Account exists; return one-time confirm URL so signup is not blocked when
    // Vercel has no SendGrid/SMTP and Supabase Auth mail is also unavailable.
    return NextResponse.json({
      ok: true,
      needsConfirmation: true,
      emailDelivered: false,
      confirmUrl: actionLink,
      userId,
      code: "EMAIL_SEND_FAILED",
      message:
        "Účet byl založen, ale potvrzovací e-mail se nepodařilo odeslat. Potvrďte účet tlačítkem níže (nebo zkontrolujte spam po opětovném odeslání).",
    });
  }

  await recordRegistrationEvent(ip, email);
  await logSecurityEvent({
    ip,
    userId: userId ?? undefined,
    action: "auth_signup:success",
    status: "ok",
    details: { emailProvider: mailed.provider, resent: alreadyExists },
  });

  return NextResponse.json({
    ok: true,
    needsConfirmation: true,
    emailDelivered: true,
    userId,
    emailProvider: mailed.provider,
    message:
      accessLevel === "physician"
        ? "Účet byl založen. Otevřete potvrzovací e-mail od MedScopeGlobal, potvrďte adresu a poté nahrajte doklad profese v sekci Účet."
        : "Účet byl založen. Ověřte e-mailovou schránku a potvrďte registraci odkazem od MedScopeGlobal.",
  });
}
