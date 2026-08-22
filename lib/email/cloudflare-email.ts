import type { EmailSendRequest } from "@/lib/email/types";
import { getSmtpFromEmail } from "@/lib/email/smtp";

type SendEmailBinding = {
  send: (message: {
    to: string | string[];
    from: string | { email: string; name?: string };
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
  }) => Promise<{ messageId: string }>;
};

/** Prefer Workers EMAIL binding when running on Cloudflare (no API key needed). */
export async function tryGetCloudflareEmailBinding(): Promise<SendEmailBinding | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const ctx = await mod.getCloudflareContext({ async: true });
    const email = (ctx?.env as { EMAIL?: SendEmailBinding } | undefined)?.EMAIL;
    if (!email || typeof email.send !== "function") return null;
    return email;
  } catch {
    return null;
  }
}

export async function isCloudflareEmailAvailable(): Promise<boolean> {
  return Boolean(await tryGetCloudflareEmailBinding());
}

export async function sendViaCloudflareEmail(
  request: EmailSendRequest
): Promise<{
  ok: boolean;
  statusCode: number;
  messageId?: string;
  error?: string;
  raw?: Record<string, unknown>;
}> {
  const email = await tryGetCloudflareEmailBinding();
  if (!email) {
    return { ok: false, statusCode: 0, error: "Cloudflare EMAIL binding unavailable" };
  }

  const fromEmail = request.fromEmail ?? getSmtpFromEmail();
  const fromName = request.fromName ?? "MedScopeGlobal";
  const recipients = Array.isArray(request.to) ? request.to : [request.to];
  const text =
    request.text ??
    request.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  try {
    const result = await email.send({
      to: recipients.length === 1 ? recipients[0]! : recipients,
      from: { email: fromEmail, name: fromName },
      subject: request.subject,
      html: request.html,
      text,
      replyTo: request.replyTo,
    });
    return {
      ok: true,
      statusCode: 202,
      messageId: result.messageId,
      raw: { provider: "cloudflare-email" },
    };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return {
      ok: false,
      statusCode: 502,
      error: err?.code
        ? `${err.code}: ${err.message || "send failed"}`
        : e instanceof Error
          ? e.message
          : "Cloudflare email send failed",
      raw: { code: err?.code },
    };
  }
}
