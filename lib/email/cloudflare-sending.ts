import { getDefaultFromEmail } from "@/lib/email/from";
import type { EmailSendRequest } from "@/lib/email/types";

type CloudflareEmailAddress = string | { email: string; name?: string };

type CloudflareEmailBinding = {
  send: (message: {
    to: CloudflareEmailAddress | CloudflareEmailAddress[];
    from: CloudflareEmailAddress;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: CloudflareEmailAddress;
  }) => Promise<{ messageId?: string } | void>;
};

export function isCloudflareEmailConfigured(): boolean {
  if (process.env.CF_EMAIL_SENDING === "0") return false;
  return (
    process.env.CF_EMAIL_SENDING === "1" ||
    process.env.MEDSCOPE_RUNTIME === "cloudflare-workers"
  );
}

async function getEmailBinding(): Promise<CloudflareEmailBinding | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const email = (env as { EMAIL?: CloudflareEmailBinding }).EMAIL;
    return email && typeof email.send === "function" ? email : null;
  } catch {
    return null;
  }
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
  const binding = await getEmailBinding();
  if (!binding) {
    return { ok: false, statusCode: 0, error: "cloudflare_email_binding_missing" };
  }

  const fromEmail = request.fromEmail ?? getDefaultFromEmail();
  const fromName = request.fromName ?? "ViaLongeVita";
  const recipients = (Array.isArray(request.to) ? request.to : [request.to])
    .map((email) => email.trim())
    .filter(Boolean);
  if (!recipients.length) {
    return { ok: false, statusCode: 400, error: "No recipients" };
  }

  try {
    const result = await binding.send({
      to: recipients.length === 1 ? recipients[0]! : recipients,
      from: { email: fromEmail, name: fromName },
      subject: request.subject,
      html: request.html,
      text: request.text,
      replyTo: request.replyTo ?? fromEmail,
    });
    const messageId =
      result && typeof result === "object" && "messageId" in result
        ? String(result.messageId ?? "")
        : undefined;
    return {
      ok: true,
      statusCode: 202,
      messageId: messageId || undefined,
      raw: { provider: "cloudflare", from: fromEmail },
    };
  } catch (error) {
    return {
      ok: false,
      statusCode: 0,
      error: error instanceof Error ? error.message : "cloudflare_email_send_failed",
    };
  }
}
