export type DigestDeliveryMode = "sendgrid" | "smtp" | "log";

export type DigestDeliveryStatus = {
  mode: DigestDeliveryMode;
  configured: boolean;
  fromEmail: string;
  hasListId: boolean;
  hasNewsletterTo: boolean;
};

/** Read-only digest config for admin UI and health checks (no secrets). */
export function getDigestDeliveryStatus(): DigestDeliveryStatus {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const smtp = Boolean(process.env.SMTP_HOST?.trim());
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim() ?? "academy@medscopeglobal.com";
  const listId = process.env.SENDGRID_ACADEMY_LIST_ID?.trim();
  const toEmail = process.env.ACADEMY_NEWSLETTER_TO?.trim();

  const mode: DigestDeliveryMode = apiKey ? "sendgrid" : smtp ? "smtp" : "log";

  return {
    mode,
    configured: Boolean(apiKey || smtp),
    fromEmail,
    hasListId: Boolean(listId),
    hasNewsletterTo: Boolean(toEmail),
  };
}
