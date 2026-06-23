import { getDigestDeliveryStatus } from "@/lib/academy/marketing/digest-config";
import type { DigestDeliveryResult } from "@/lib/academy/marketing/digest-delivery";
import { generateWeeklyDigest } from "@/lib/academy/marketing/weekly-digest";

function buildTestHtml(subject: string, intro: string): string {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#021d33">
<p><strong>Test digest — MedScope Academy</strong></p>
<p>${intro}</p>
<p style="color:#64748b;font-size:12px">Odesláno z admin test-send (${subject}).</p>
</body></html>`;
}

/** Sends a one-off test digest to a single recipient (SendGrid or log-only). */
export async function sendTestDigestEmail(toEmail?: string): Promise<DigestDeliveryResult & { to: string }> {
  const { configured, fromEmail, hasNewsletterTo } = getDigestDeliveryStatus();
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const recipient =
    toEmail?.trim() ||
    process.env.ACADEMY_NEWSLETTER_TO?.trim() ||
    fromEmail;

  const digest = await generateWeeklyDigest();
  const subject = `[TEST] ${digest.subject}`;

  if (!configured || !apiKey) {
    console.info("[academy] test digest (log-only)", {
      to: recipient,
      subject,
      items: digest.items.length,
      hasNewsletterTo,
    });
    return { sent: false, mode: "log", to: recipient };
  }

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipient }] }],
        from: { email: fromEmail, name: "MedScope Academy" },
        subject,
        content: [
          {
            type: "text/plain",
            value: `Test digest\n\n${digest.intro}\n\n${digest.items.map((i) => `- ${i.title}`).join("\n")}`,
          },
          { type: "text/html", value: buildTestHtml(subject, digest.intro) },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { sent: false, mode: "sendgrid", error: `SendGrid ${res.status}: ${text.slice(0, 120)}`, to: recipient };
    }

    return {
      sent: true,
      mode: "sendgrid",
      messageId: res.headers.get("x-message-id") ?? undefined,
      to: recipient,
    };
  } catch (e) {
    return { sent: false, mode: "sendgrid", error: (e as Error).message, to: recipient };
  }
}
