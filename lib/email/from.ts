/** Canonical From for ViaLongeVita / MedScopeGlobal mail. */
export const NEWSLETTER_FROM_EMAIL = "info@medscopeglobal.com";

export function getDefaultFromEmail(): string {
  return (
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    process.env.SMTP_FROM_EMAIL?.trim() ||
    NEWSLETTER_FROM_EMAIL
  );
}
