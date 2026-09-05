import { persistEmailLog } from "@/lib/email/log";
import { isCloudflareEmailConfigured, sendViaCloudflareEmail } from "@/lib/email/cloudflare-sending";
import { isSendGridConfigured, sendViaSendGrid } from "@/lib/email/sendgrid";
import { isSmtpConfigured, sendViaSmtp } from "@/lib/email/smtp";
import type { EmailProvider, EmailSendRequest, EmailSendResponse } from "@/lib/email/types";

function primaryRecipient(to: string | string[]): string {
  const list = Array.isArray(to) ? to : [to];
  return list[0]?.trim() ?? "";
}

async function logSend(
  request: EmailSendRequest,
  result: Omit<EmailSendResponse, "loggedAt" | "category" | "recipient">
): Promise<EmailSendResponse> {
  const response: EmailSendResponse = {
    ...result,
    loggedAt: new Date().toISOString(),
    category: request.category,
    recipient: primaryRecipient(request.to),
  };

  await persistEmailLog({
    sent_at: response.loggedAt,
    email_type: request.category,
    recipient: response.recipient,
    subject: request.subject,
    status: response.status,
    response_code: response.statusCode ?? null,
    provider: response.provider,
    fallback_used: response.fallbackUsed,
    message_id: response.messageId ?? null,
    error: response.error ?? null,
    metadata: { ...(request.metadata ?? {}), raw: response.raw },
  });

  if (response.fallbackUsed) {
    console.warn("[email] SMTP fallback used", {
      recipient: response.recipient,
      subject: request.subject,
      error: response.error,
    });
  }

  return response;
}

/** Prefer Cloudflare Email Sending on the Worker; then SendGrid; SMTP last. */
export async function sendEmail(request: EmailSendRequest): Promise<EmailSendResponse> {
  const recipient = primaryRecipient(request.to);
  if (!recipient) {
    return logSend(request, {
      ok: false,
      status: "failed",
      provider: "none",
      fallbackUsed: false,
      error: "Missing recipient",
    });
  }

  if (isCloudflareEmailConfigured()) {
    const cf = await sendViaCloudflareEmail(request);
    if (cf.ok) {
      return logSend(request, {
        ok: true,
        status: "sent",
        provider: "cloudflare",
        fallbackUsed: false,
        statusCode: cf.statusCode,
        messageId: cf.messageId,
        raw: cf.raw,
      });
    }
    console.warn("[email] Cloudflare Email Sending failed, trying fallbacks", cf.error);

    if (isSendGridConfigured()) {
      const sg = await sendViaSendGrid(request);
      if (sg.ok) {
        return logSend(request, {
          ok: true,
          status: "sent",
          provider: "sendgrid",
          fallbackUsed: true,
          statusCode: sg.statusCode,
          messageId: sg.messageId,
          raw: { cloudflareError: cf.error, sendgrid: sg.raw },
        });
      }
    }

    if (isSmtpConfigured()) {
      const smtp = await sendViaSmtp(request);
      return logSend(request, {
        ok: smtp.ok,
        status: smtp.ok ? "sent" : "failed",
        provider: "smtp",
        fallbackUsed: true,
        statusCode: smtp.statusCode,
        messageId: smtp.messageId,
        error: smtp.ok ? undefined : smtp.error ?? cf.error,
        raw: { cloudflareError: cf.error, smtp: smtp.raw },
      });
    }

    return logSend(request, {
      ok: false,
      status: "failed",
      provider: "cloudflare",
      fallbackUsed: false,
      statusCode: cf.statusCode,
      error: cf.error,
      raw: cf.raw,
    });
  }

  if (isSendGridConfigured()) {
    const sg = await sendViaSendGrid(request);
    if (sg.ok) {
      return logSend(request, {
        ok: true,
        status: "sent",
        provider: "sendgrid",
        fallbackUsed: false,
        statusCode: sg.statusCode,
        messageId: sg.messageId,
        raw: sg.raw,
      });
    }

    console.warn("[email] SendGrid failed, trying SMTP fallback", sg.error);

    if (isSmtpConfigured()) {
      const smtp = await sendViaSmtp(request);
      return logSend(request, {
        ok: smtp.ok,
        status: smtp.ok ? "sent" : "failed",
        provider: "smtp" as EmailProvider,
        fallbackUsed: true,
        statusCode: smtp.statusCode,
        messageId: smtp.messageId,
        error: smtp.ok ? undefined : smtp.error ?? sg.error,
        raw: { sendgridError: sg.error, smtp: smtp.raw },
      });
    }

    return logSend(request, {
      ok: false,
      status: "failed",
      provider: "sendgrid",
      fallbackUsed: false,
      statusCode: sg.statusCode,
      error: sg.error,
      raw: sg.raw,
    });
  }

  if (isSmtpConfigured()) {
    const smtp = await sendViaSmtp(request);
    return logSend(request, {
      ok: smtp.ok,
      status: smtp.ok ? "sent" : "failed",
      provider: "smtp",
      fallbackUsed: false,
      statusCode: smtp.statusCode,
      messageId: smtp.messageId,
      error: smtp.error,
      raw: smtp.raw,
    });
  }

  console.info("[email] log-only (no provider configured)", {
    to: recipient,
    subject: request.subject,
    category: request.category,
  });

  return logSend(request, {
    ok: false,
    status: "skipped",
    provider: "none",
    fallbackUsed: false,
    error: "No email provider configured (Cloudflare Email, SENDGRID_API_KEY, or SMTP)",
  });
}

export { isSendGridConfigured, isSmtpConfigured, isCloudflareEmailConfigured };
