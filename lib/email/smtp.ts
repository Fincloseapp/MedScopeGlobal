import type { EmailSendRequest } from "@/lib/email/types";

/** Cloudflare Email Sending (beta) — username is always the literal string api_token. */
export const CLOUDFLARE_EMAIL_SMTP = {
  host: "smtp.mx.cloudflare.net",
  port: 465,
  user: "api_token",
} as const;

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

export function getSmtpFromEmail(): string {
  const user = process.env.SMTP_USER?.trim();
  // Cloudflare SMTP username is "api_token" — never use it as From address
  const userAsFrom =
    user && user.toLowerCase() !== "api_token" ? user : undefined;
  return (
    process.env.SMTP_FROM_EMAIL?.trim() ||
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    userAsFrom ||
    "noreply@mail.medscopeglobal.com"
  );
}

export async function sendViaSmtp(
  request: EmailSendRequest
): Promise<{ ok: boolean; statusCode: number; messageId?: string; error?: string; raw?: Record<string, unknown> }> {
  if (!isSmtpConfigured()) {
    return { ok: false, statusCode: 0, error: "SMTP not configured" };
  }

  const host = process.env.SMTP_HOST!.trim();
  const isCloudflare = host.includes("cloudflare");
  const port = Number(
    process.env.SMTP_PORT ?? (isCloudflare ? CLOUDFLARE_EMAIL_SMTP.port : 587)
  );
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  // Cloudflare Email Sending: port 465 + implicit TLS only (no STARTTLS / 587)
  const secure =
    port === 465 ||
    process.env.SMTP_SECURE === "true" ||
    isCloudflare;
  const fromEmail = request.fromEmail ?? getSmtpFromEmail();
  const fromName = request.fromName ?? "MedScopeGlobal";
  const recipients = Array.isArray(request.to) ? request.to : [request.to];

  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      ...(isCloudflare ? { requireTLS: false } : {}),
    });

    const info = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipients.join(", "),
      subject: request.subject,
      text: request.text ?? request.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      html: request.html,
      replyTo: request.replyTo,
      attachments: request.attachments?.map((a) => ({
        filename: a.filename,
        content:
          a.encoding === "base64"
            ? Buffer.from(a.content, "base64")
            : a.content,
        contentType: a.type,
      })),
    });

    return {
      ok: true,
      statusCode: 250,
      messageId: info.messageId,
      raw: { messageId: info.messageId, accepted: info.accepted },
    };
  } catch (e) {
    return { ok: false, statusCode: 0, error: (e as Error).message };
  }
}
