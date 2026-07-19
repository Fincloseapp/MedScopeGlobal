import { sendEmail } from "@/lib/email/engine";
import { SITE } from "@/lib/config/site";
import { getPublicEnv, getServiceRoleKey } from "@/lib/env";

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
    "MedScopeGlobal <noreply@medscopeglobal.com>";

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
}): { subject: string; html: string; text: string } {
  const subject = "Potvrďte registraci — MedScopeGlobal";
  const greeting = params.fullName?.trim() || "vážený uživateli";
  const text = [
    `Dobrý den, ${greeting},`,
    "",
    "děkujeme za registraci na MedScopeGlobal.",
    "Pro aktivaci účtu potvrďte e-mailovou adresu:",
    params.actionLink,
    "",
    "Odkaz platí omezenou dobu. Pokud jste se neregistrovali, e-mail ignorujte.",
    "",
    "— MedScopeGlobal",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#021d33">
      <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#005B96">MedScopeGlobal</p>
      <h1 style="font-size:24px;line-height:1.3">Potvrzení registrace</h1>
      <p>Dobrý den, ${escapeHtml(greeting)},</p>
      <p>děkujeme za registraci. Pro aktivaci účtu klikněte na tlačítko níže:</p>
      <p style="margin:28px 0">
        <a href="${params.actionLink}"
           style="background:#005B96;color:#fff;padding:12px 20px;text-decoration:none;display:inline-block">
          Potvrdit e-mail
        </a>
      </p>
      <p style="font-size:13px;color:#475569">Pokud tlačítko nefunguje, zkopírujte odkaz:<br/>
        <a href="${params.actionLink}" style="color:#005B96;word-break:break-all">${params.actionLink}</a>
      </p>
      <p style="font-size:12px;color:#64748b">© ${SITE.name}</p>
    </div>
  `;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
}): Promise<{ ok: boolean; provider?: string; error?: string }> {
  const content = buildSignupConfirmEmail({
    fullName: params.fullName,
    actionLink: params.actionLink,
  });

  const primary = await sendEmail({
    to: params.to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    category: "transactional",
    metadata: { kind: "auth_signup_confirm" },
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
