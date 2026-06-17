export type DigestDeliveryMode = "sendgrid" | "log";

export type DigestDeliveryStatus = {
  mode: DigestDeliveryMode;
  configured: boolean;
  fromEmail: string;
  hasListId: boolean;
  hasNewsletterTo: boolean;
};

/** Read-only SendGrid digest config for admin UI and health checks (no secrets). */
export function getDigestDeliveryStatus(): DigestDeliveryStatus {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim() ?? "academy@medscopeglobal.com";
  const listId = process.env.SENDGRID_ACADEMY_LIST_ID?.trim();
  const toEmail = process.env.ACADEMY_NEWSLETTER_TO?.trim();

  return {
    mode: apiKey ? "sendgrid" : "log",
    configured: Boolean(apiKey),
    fromEmail,
    hasListId: Boolean(listId),
    hasNewsletterTo: Boolean(toEmail),
  };
}
