import type { WeeklyDigest } from "@/lib/academy/marketing/weekly-digest";
import { getDigestDeliveryStatus } from "@/lib/academy/marketing/digest-config";
import { sendEmail } from "@/lib/email/engine";
import { isSendGridConfigured } from "@/lib/email/sendgrid";

export type DigestDeliveryResult = {
  sent: boolean;
  mode: "sendgrid" | "smtp" | "log";
  messageId?: string;
  error?: string;
  fallbackUsed?: boolean;
};

function buildDigestHtml(digest: WeeklyDigest): string {
  const items = digest.items
    .map(
      (item) =>
        `<li><a href="${item.url}">${item.title}</a> <span style="color:#64748b">(${item.type})</span></li>`
    )
    .join("");

  return `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#021d33">
<p>${digest.intro}</p>
<ul>${items || "<li>Žádné novinky tento týden.</li>"}</ul>
<p style="color:#64748b;font-size:12px"><a href="https://medscopeglobal.com/academy">MedScope Academy</a></p>
</body></html>`;
}

function buildDigestText(digest: WeeklyDigest): string {
  const lines = digest.items.map((item) => `- ${item.title}: ${item.url}`);
  return `${digest.intro}\n\n${lines.join("\n") || "Žádné novinky tento týden."}\n\nhttps://medscopeglobal.com/academy`;
}

/** Sends weekly digest via v28 email engine (SendGrid → SMTP fallback) or SendGrid list API. */
export async function deliverWeeklyDigest(
  digest: WeeklyDigest,
  eventId: string
): Promise<DigestDeliveryResult> {
  const { configured, fromEmail, hasListId, hasNewsletterTo } = getDigestDeliveryStatus();
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const listId = process.env.SENDGRID_ACADEMY_LIST_ID?.trim();
  const toEmail = process.env.ACADEMY_NEWSLETTER_TO?.trim();

  if (!configured || (!apiKey && !process.env.SMTP_HOST)) {
    console.info("[academy] weekly digest (log-only)", {
      eventId,
      subject: digest.subject,
      items: digest.items.length,
      generatedAt: digest.generatedAt,
      hasListId,
      hasNewsletterTo,
    });
    return { sent: false, mode: "log" };
  }

  if (listId && apiKey) {
    try {
      const body: Record<string, unknown> = {
        personalizations: [{ list_ids: [listId] }],
        from: { email: fromEmail, name: "MedScope Academy" },
        subject: digest.subject,
        content: [
          { type: "text/plain", value: buildDigestText(digest) },
          { type: "text/html", value: buildDigestHtml(digest) },
        ],
      };

      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("[academy] SendGrid list error", res.status, text.slice(0, 300));
        return { sent: false, mode: "sendgrid", error: `SendGrid ${res.status}` };
      }

      const messageId = res.headers.get("x-message-id") ?? undefined;
      console.info("[academy] weekly digest sent (list)", { eventId, messageId });
      return { sent: true, mode: "sendgrid", messageId };
    } catch (e) {
      return { sent: false, mode: "sendgrid", error: (e as Error).message };
    }
  }

  const recipient = toEmail ?? fromEmail;
  const result = await sendEmail({
    to: recipient,
    subject: digest.subject,
    html: buildDigestHtml(digest),
    text: buildDigestText(digest),
    category: "marketing",
    fromEmail,
    fromName: "MedScope Academy",
    metadata: { eventId, academyDigest: true },
  });

  const mode = result.provider === "smtp" ? "smtp" : result.provider === "sendgrid" ? "sendgrid" : "log";
  if (result.ok) {
    console.info("[academy] weekly digest sent", { eventId, messageId: result.messageId, mode });
  }

  return {
    sent: result.ok,
    mode: result.ok ? mode : isSendGridConfigured() ? "sendgrid" : "log",
    messageId: result.messageId,
    error: result.error,
    fallbackUsed: result.fallbackUsed,
  };
}
