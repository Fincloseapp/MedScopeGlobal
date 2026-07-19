import type { EmailSendRequest } from "@/lib/email/types";

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

export function getSmtpFromEmail(): string {
  return (
    process.env.SMTP_FROM_EMAIL?.trim() ||
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "info@medscopeglobal.com"
  );
}

export async function sendViaSmtp(
  request: EmailSendRequest
): Promise<{ ok: boolean; statusCode: number; messageId?: string; error?: string; raw?: Record<string, unknown> }> {
  if (!isSmtpConfigured()) {
    return { ok: false, statusCode: 0, error: "SMTP not configured" };
  }

  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const secure = port === 465 || process.env.SMTP_SECURE === "true";
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
