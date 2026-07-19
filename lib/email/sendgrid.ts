import type { EmailAttachment, EmailSendRequest } from "@/lib/email/types";

export function isSendGridConfigured(): boolean {
  return Boolean(process.env.SENDGRID_API_KEY?.trim());
}

export function getSendGridFromEmail(): string {
  return (
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    process.env.SENDGRID_FROM?.trim() ||
    "noreply@mail.medscopeglobal.com"
  );
}

function toRecipients(to: string | string[]): { email: string }[] {
  const list = Array.isArray(to) ? to : [to];
  return list.map((email) => ({ email: email.trim() })).filter((r) => r.email);
}

function encodeAttachment(att: EmailAttachment) {
  const content =
    att.encoding === "base64"
      ? att.content
      : Buffer.from(att.content, "utf8").toString("base64");
  return {
    content,
    filename: att.filename,
    type: att.type ?? "text/html",
    disposition: att.disposition ?? "attachment",
  };
}

export async function sendViaSendGrid(
  request: EmailSendRequest
): Promise<{ ok: boolean; statusCode: number; messageId?: string; error?: string; raw?: Record<string, unknown> }> {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, statusCode: 0, error: "SENDGRID_API_KEY not configured" };
  }

  const listId = request.sendGridListId?.trim();
  if (!listId) {
    const recipients = toRecipients(request.to);
    if (recipients.length === 0) {
      return { ok: false, statusCode: 400, error: "No recipients" };
    }
  }

  const fromEmail = request.fromEmail ?? getSendGridFromEmail();
  const fromName = request.fromName ?? "MedScopeGlobal";

  const body: Record<string, unknown> = {
    personalizations: listId ? [{ list_ids: [listId] }] : [{ to: toRecipients(request.to) }],
    from: { email: fromEmail, name: fromName },
    subject: request.subject,
    content: [
      ...(request.text ? [{ type: "text/plain", value: request.text }] : []),
      { type: "text/html", value: request.html },
    ],
    categories: [request.category],
    custom_args: request.metadata ?? {},
  };

  if (request.replyTo) {
    body.reply_to = { email: request.replyTo };
  }
  if (request.attachments?.length) {
    body.attachments = request.attachments.map(encodeAttachment);
  }

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    const messageId = res.headers.get("x-message-id") ?? undefined;
    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        statusCode: res.status,
        error: text.slice(0, 500) || `SendGrid ${res.status}`,
        raw: { status: res.status, body: text.slice(0, 300) },
      };
    }

    return { ok: true, statusCode: res.status, messageId, raw: { status: res.status, messageId } };
  } catch (e) {
    return { ok: false, statusCode: 0, error: (e as Error).message };
  }
}
