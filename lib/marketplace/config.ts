import { getContactRecipient } from "@/lib/services/contact-mail";

export const MARKETPLACE_INBOX_DEFAULT = "inzerce@medscopeglobal.com";

export function marketplaceInboxEmail(): string {
  return (
    process.env.MARKETPLACE_INBOX_EMAIL?.trim() ||
    process.env.ADS_EMAIL?.trim() ||
    MARKETPLACE_INBOX_DEFAULT
  );
}

export function marketplaceAdminNotifyEmail(): string {
  return getContactRecipient("partner");
}

export function marketplaceInboundSecret(): string | null {
  return (
    process.env.MARKETPLACE_INBOUND_SECRET?.trim() ||
    process.env.SENDGRID_WEBHOOK_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    null
  );
}
