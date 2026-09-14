import { sendEmail } from "@/lib/email/engine";
import { marketplaceAdminNotifyEmail, marketplaceInboxEmail } from "@/lib/marketplace/config";
import { marketplaceReplyCopy, type MarketplaceReplyTopic } from "@/lib/marketplace/auto-reply";
import type { MarketplaceListing } from "@/lib/marketplace/types";

export async function sendMarketplaceAutoReply(input: {
  to: string;
  topic: MarketplaceReplyTopic;
  listing?: MarketplaceListing | null;
}): Promise<{ ok: boolean; error?: string }> {
  const letter = marketplaceReplyCopy(input.topic);
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
    },
  });
  return { ok: sent.ok, error: sent.error };
}

export async function sendMarketplaceAck(listing: MarketplaceListing): Promise<{ ok: boolean; error?: string }> {
  if (!listing.contact_email) return { ok: false, error: "missing_email" };
  const isDemand = listing.kind === "demand";
  const subject = isDemand
    ? `Poptávka na tržišti MedScopeGlobal — ${listing.title}`
    : `Nabídka na tržišti MedScopeGlobal — ${listing.title}`;
  const html = isDemand
    ? `<p>Dobrý den, ${listing.company},</p>
       <p>poptávku <strong>${listing.title}</strong> jsme zveřejnili na tržišti. Inzerenti s aktivním paušálem dostanou kontakt e-mailem. Vy nic neplatíte.</p>
       <p><a href="https://medscopeglobal.com/exchange#poptavky">Otevřít poptávky</a></p>
       <p>MedScopeGlobal · inzerce@medscopeglobal.com</p>`
    : `<p>Dobrý den, ${listing.company},</p>
       <p>nabídku <strong>${listing.title}</strong> jsme přijali. Na tržišti je vidět hned. Kontakty z poptávek dostanete, jakmile je paušál aktivní — od 4 900 Kč / měsíc, bez provize z obchodu.</p>
       <p><a href="https://medscopeglobal.com/inzerce/pausal">Objednat paušál</a> ·
          <a href="https://medscopeglobal.com/exchange/navod">Návod</a> ·
          <a href="https://medscopeglobal.com/exchange">Tržiště</a></p>
       <p>Na tento e-mail můžete odpovědět s jakýmkoli dotazem — odpovíme automaticky.</p>
       <p>MedScopeGlobal · inzerce@medscopeglobal.com</p>`;
  const sent = await sendEmail({
    to: listing.contact_email,
    replyTo: marketplaceInboxEmail(),
    subject,
    html,
    text: subject,
    category: "transactional",
    metadata: { kind: "marketplace_ack", listingId: listing.id, listingKind: listing.kind },
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
