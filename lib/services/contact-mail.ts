import { logAdminEvent } from "@/lib/logging";

const DEFAULT_CONTACT_EMAIL = "info@medscopeglobal.com";
const DEFAULT_ADS_EMAIL = "ads@medscopeglobal.com";

function resolveRecipient(emailEnv: string | undefined, fallback: string) {
  return (emailEnv ?? fallback).trim() || fallback;
}

export async function sendContactEmail({
  kind,
  recipient,
  subject,
  html,
  text,
  payload,
}: {
  kind: "general" | "partner";
  recipient: string;
  subject: string;
  html: string;
  text: string;
  payload: Record<string, unknown>;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    await logAdminEvent("contact_mail_fallback", {
      kind,
      recipient,
      subject,
      payload,
      fallback: true,
    });
    console.info(`Contact mail fallback ${kind}: ${recipient}`);
    return { ok: true, fallback: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MedScopeGlobal <noreply@medscopeglobal.com>",
      to: [recipient],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    await logAdminEvent("contact_mail_failed", {
      kind,
      recipient,
      subject,
      payload,
      status: response.status,
      error: errText,
    });
    throw new Error(`Failed to send mail: ${response.status}`);
  }

  await logAdminEvent("contact_mail_sent", {
    kind,
    recipient,
    subject,
    payload,
  });

  return { ok: true, fallback: false };
}

export function getContactRecipient(kind: "general" | "partner") {
  if (kind === "partner") {
    return resolveRecipient(process.env.ADS_EMAIL, DEFAULT_ADS_EMAIL);
  }

  return resolveRecipient(process.env.CONTACT_EMAIL, DEFAULT_CONTACT_EMAIL);
}
