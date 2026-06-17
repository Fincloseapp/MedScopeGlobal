import type { WeeklyDigest } from "@/lib/academy/marketing/weekly-digest";

export type DigestDeliveryResult = {
  sent: boolean;
  mode: "sendgrid" | "log";
  messageId?: string;
  error?: string;
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

/** Sends weekly digest via SendGrid when configured; otherwise logs only. */
export async function deliverWeeklyDigest(
  digest: WeeklyDigest,
  eventId: string
): Promise<DigestDeliveryResult> {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim() ?? "academy@medscopeglobal.com";
  const listId = process.env.SENDGRID_ACADEMY_LIST_ID?.trim();
  const toEmail = process.env.ACADEMY_NEWSLETTER_TO?.trim();

  if (!apiKey) {
    console.info("[academy] weekly digest (log-only)", {
      eventId,
      subject: digest.subject,
      items: digest.items.length,
      generatedAt: digest.generatedAt,
    });
    return { sent: false, mode: "log" };
  }

  try {
    const body: Record<string, unknown> = {
      personalizations: [
        listId
          ? { list_ids: [listId] }
          : { to: [{ email: toEmail ?? fromEmail }] },
      ],
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
      console.error("[academy] SendGrid error", res.status, text.slice(0, 300));
      return { sent: false, mode: "sendgrid", error: `SendGrid ${res.status}` };
    }

    const messageId = res.headers.get("x-message-id") ?? undefined;
    console.info("[academy] weekly digest sent", { eventId, messageId, items: digest.items.length });
    return { sent: true, mode: "sendgrid", messageId };
  } catch (e) {
    const error = (e as Error).message;
    console.error("[academy] deliverWeeklyDigest", error);
    return { sent: false, mode: "sendgrid", error };
  }
}
