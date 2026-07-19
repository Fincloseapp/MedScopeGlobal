import { NextResponse } from "next/server";
import { z } from "zod";
import { sendSignupConfirmationEmail } from "@/lib/auth/send-signup-confirmation";
import { SITE } from "@/lib/config/site";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { createServiceRoleClient } from "@/lib/supabase/service";

const schema = z.object({
  email: z.string().email().max(320),
  captchaToken: z.string().optional(),
});

function captchaFullyConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  );
}

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: captchaFullyConfigured(),
    action: "auth_resend_confirmation",
  });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný e-mail." }, { status: 400 });
  }

  const email = sanitizeText(body.email.toLowerCase(), 320);
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    request.headers.get("origin")?.replace(/\/$/, "") ||
    SITE.url.replace(/\/$/, "");
  const redirectTo = `${origin}/auth/callback?next=/account`;

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "Auth server není dostupný." }, { status: 503 });
  }

  const { data: profile } = await admin
    .from("users")
    .select("id, full_name")
    .eq("email", email)
    .maybeSingle();

  if (profile?.id) {
    const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
    if (authUser.user?.email_confirmed_at) {
      return NextResponse.json(
        { error: "E-mail je už potvrzený. Můžete se přihlásit." },
        { status: 409 }
      );
    }
  }

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (linkErr || !linkData?.properties?.action_link) {
    return NextResponse.json(
      {
        error:
          "Nepodařilo se připravit potvrzovací odkaz. Zkontrolujte e-mail nebo se zaregistrujte znovu.",
      },
      { status: 400 }
    );
  }

  const mailed = await sendSignupConfirmationEmail({
    to: email,
    fullName: (profile?.full_name as string) || email.split("@")[0] || "",
    actionLink: linkData.properties.action_link as string,
    redirectTo,
  });

  if (!mailed.ok) {
    return NextResponse.json(
      { error: "Odeslání e-mailu selhalo. Zkuste to za chvíli." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Potvrzovací e-mail byl odeslán. Zkontrolujte schránku i spam.",
  });
}
