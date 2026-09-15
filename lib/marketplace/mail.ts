import { sendEmail } from "@/lib/email/engine";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";
import { marketplaceUiLang } from "@/lib/i18n/marketplace-ui-locale";
import { marketplaceAdminNotifyEmail, marketplaceInboxEmail } from "@/lib/marketplace/config";
import { marketplaceReplyCopy, type MarketplaceReplyTopic } from "@/lib/marketplace/auto-reply";
import type { MarketplaceListing } from "@/lib/marketplace/types";
import { campaignPublicUrl } from "@/lib/sales/campaign-copy";

function helloLine(locale: string | null | undefined, company: string): string {
  const lang = marketplaceUiLang(locale);
  if (lang === "cs") return `Dobrý den, ${company},`;
  if (lang === "sk") return `Dobrý deň, ${company},`;
  if (lang === "de") return `Guten Tag, ${company},`;
  if (lang === "fr") return `Bonjour, ${company},`;
  if (lang === "it") return `Buongiorno, ${company},`;
  if (lang === "es") return `Hola, ${company},`;
  if (lang === "pl") return `Dzień dobry, ${company},`;
  if (lang === "pt" || lang === "pt-BR") return `Olá, ${company},`;
  return `Dear ${company},`;
}

export async function sendMarketplaceAutoReply(input: {
  to: string;
  topic: MarketplaceReplyTopic;
  listing?: MarketplaceListing | null;
  locale?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const letter = marketplaceReplyCopy(input.topic, input.locale);
  const sent = await sendEmail({
    to: input.to,
    replyTo: marketplaceInboxEmail(),
    subject: letter.subject,
    html: letter.html,
    text: letter.text,
    category: "transactional",
    metadata: {
      kind: "marketplace_auto_reply",
      topic: input.topic,
      listingId: input.listing?.id ?? null,
      locale: input.locale ?? null,
    },
  });
  return { ok: sent.ok, error: sent.error };
}

export async function sendMarketplaceAck(
  listing: MarketplaceListing,
  locale?: string | null
): Promise<{ ok: boolean; error?: string }> {
  if (!listing.contact_email) return { ok: false, error: "missing_email" };
  const copy = getMarketplaceUiCopy(locale);
  const loc = locale?.trim() || "cs";
  const isDemand = listing.kind === "demand";
  const subject = `${isDemand ? copy.ackDemandSubject : copy.ackOfferSubject} — ${listing.title}`;
  const market = campaignPublicUrl(loc, "/exchange");
  const pausal = campaignPublicUrl(loc, "/inzerce/pausal");
  const navod = campaignPublicUrl(loc, "/exchange/navod");
  const html = isDemand
    ? `<p>${helloLine(locale, listing.company)}</p>
       <p>${copy.ackDemandHtml}</p>
       <p><strong>${listing.title}</strong></p>
       <p><a href="${market}">${copy.demandsHeading}</a></p>
       <p>MedScopeGlobal · inzerce@medscopeglobal.com</p>`
    : `<p>${helloLine(locale, listing.company)}</p>
       <p>${copy.ackOfferHtml}</p>
       <p><strong>${listing.title}</strong></p>
       <p><a href="${pausal}">${copy.orderPausal}</a> ·
          <a href="${navod}">${copy.guideNav}</a> ·
          <a href="${market}">${copy.offersHeading}</a></p>
       <p>MedScopeGlobal · inzerce@medscopeglobal.com</p>`;
  const sent = await sendEmail({
    to: listing.contact_email,
    replyTo: marketplaceInboxEmail(),
    subject,
    html,
    text: subject,
    category: "transactional",
    metadata: { kind: "marketplace_ack", listingId: listing.id, listingKind: listing.kind, locale: loc },
  });
  return { ok: sent.ok, error: sent.error };
}

export async function notifyMarketplaceAdmin(listing: MarketplaceListing, extra?: string): Promise<void> {
  const to = marketplaceAdminNotifyEmail();
  await sendEmail({
    to,
    replyTo: listing.contact_email ?? marketplaceInboxEmail(),
    subject: `[Tržiště] ${listing.kind} — ${listing.company}`,
    html: `<p>${listing.kind}: <strong>${listing.title}</strong></p>
      <p>Firma: ${listing.company}<br>Kontakt: ${listing.contact_name ?? "—"} (${listing.contact_email ?? "—"})
      ${listing.phone ? `<br>Tel: ${listing.phone}` : ""}</p>
      <p>${listing.summary}</p>
      ${extra ? `<p>${extra}</p>` : ""}
      <p><a href="https://medscopeglobal.com/admin/sales?tab=trziste">Otevřít obchodní oddělení</a></p>`,
    text: `${listing.kind} ${listing.company}: ${listing.title}`,
    category: "system",
    metadata: { kind: "marketplace_admin", listingId: listing.id },
  });
}

export async function sendAdOfferViaEngine(input: {
  to: string;
  company: string;
  subject: string;
  html: string;
  text: string;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string; fallbackLogged?: boolean }> {
  const sent = await sendEmail({
    to: input.to,
    replyTo: marketplaceInboxEmail(),
    subject: input.subject,
    html: input.html,
    text: input.text,
    category: "transactional",
    metadata: { kind: "ads_mail", company: input.company, ...(input.metadata ?? {}) },
  });
  return { ok: sent.ok, error: sent.error };
}
