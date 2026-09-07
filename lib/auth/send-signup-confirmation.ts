import { loadEmailTemplate } from "@/lib/email/ai-generator";
import { sendEmail } from "@/lib/email/engine";
import { SITE } from "@/lib/config/site";
import { getPublicEnv, getServiceRoleKey } from "@/lib/env";
import { getAccountEmailCopy } from "@/lib/i18n/account-email-copy";
import { resolveEmailLocale } from "@/lib/i18n/email-locale";

async function sendViaResend(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, error: "RESEND_API_KEY missing" };

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    "MedScopeGlobal <noreply@mail.medscopeglobal.com>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    return { ok: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
  }
  return { ok: true };
}

/** Fallback when SendGrid/SMTP/Resend are not configured — uses Supabase Auth SMTP/templates. */
async function sendViaSupabaseAuthResend(params: {
  email: string;
  redirectTo: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { url, anonKey } = getPublicEnv();
    let authHeader = anonKey;
    try {
      authHeader = getServiceRoleKey();
    } catch {
      /* anon key is enough for /resend */
    }

    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/resend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify({
        type: "signup",
        email: params.email,
        options: { email_redirect_to: params.redirectTo },
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Supabase Auth resend ${res.status}: ${(await res.text()).slice(0, 200)}`,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Supabase Auth resend failed",
    };
  }
}

export function buildSignupConfirmEmail(params: {
  fullName: string;
  actionLink: string;
  locale?: string | null;
}): { subject: string; html: string; text: string } {
  const locale = resolveEmailLocale(params.locale);
  const copy = getAccountEmailCopy(locale);
  const greeting = params.fullName?.trim() || copy.signupGreeting;
  const subject = copy.signupSubject;
  const text = [
    `${greeting},`,
    "",
    copy.signupIntro,
    copy.signupCta + ":",
    params.actionLink,
    "",
    copy.signupExpiry,
    copy.signupIgnore,
    "",
    `— ${SITE.name}`,
  ].join("\n");

  const templated = loadEmailTemplate("signup-confirm", {
    name: greeting,
    confirm_url: params.actionLink,
  });
  const html =
    locale === "cs"
      ? templated
      : `<!DOCTYPE html><html lang="${locale}"><body style="font-family:system-ui,sans-serif;color:#021d33;padding:24px">
  <h1 style="color:#005B96">${copy.signupSubject}</h1>
  <p>${greeting}, ${copy.signupIntro}</p>
  <p><a href="${params.actionLink}" style="display:inline-block;background:#005B96;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">${copy.signupCta}</a></p>
  <p style="color:#64748b;font-size:13px">${copy.signupExpiry} ${copy.signupIgnore}</p>
  <p>— ${SITE.name}</p>
</body></html>`;

  return { subject, html, text };
}

/**
 * Send confirmation via SendGrid/SMTP → Resend → Supabase Auth e-mail.
 * App providers send our branded link; Supabase fallback uses Auth templates.
 */
export async function sendSignupConfirmationEmail(params: {
  to: string;
  fullName: string;
  actionLink: string;
  redirectTo: string;
  locale?: string | null;
}): Promise<{ ok: boolean; provider?: string; error?: string }> {
  const content = buildSignupConfirmEmail({
    fullName: params.fullName,
    actionLink: params.actionLink,
    locale: params.locale,
  });

  const primary = await sendEmail({
    to: params.to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    category: "transactional",
    metadata: { kind: "auth_signup_confirm", locale: params.locale ?? "en" },
  });

  if (primary.ok) {
    return { ok: true, provider: primary.provider };
  }

  const resend = await sendViaResend({
    to: params.to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });

  if (resend.ok) {
    return { ok: true, provider: "resend" };
  }

  const supabaseMail = await sendViaSupabaseAuthResend({
    email: params.to,
    redirectTo: params.redirectTo,
  });

  if (supabaseMail.ok) {
    return { ok: true, provider: "supabase_auth" };
  }

  return {
    ok: false,
    error:
      primary.error ||
      resend.error ||
      supabaseMail.error ||
      "Email delivery failed",
  };
}
