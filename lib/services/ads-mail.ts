import { SITE } from "@/lib/config/site";
import { sendAdOfferViaEngine } from "@/lib/marketplace/mail";
import { marketplaceInboxEmail } from "@/lib/marketplace/config";
import { getContactRecipient } from "@/lib/services/contact-mail";
import type { AdsRequestRow } from "@/types/database";

function formatRequest(req: AdsRequestRow) {
  return `
    <p><strong>Firma:</strong> ${req.company}</p>
    <p><strong>Kontakt:</strong> ${req.contact_person} (${req.email})</p>
    <p><strong>Typ:</strong> ${req.type}</p>
    <p><strong>Pozice:</strong> ${req.position ?? "—"}</p>
    <p><strong>Cena:</strong> ${req.price ?? "—"} Kč</p>
    <p><strong>ID:</strong> ${req.id}</p>
  `;
}

export async function sendAdRequestNotification(req: AdsRequestRow) {
  const recipient = getContactRecipient("partner");
  const subject = `[MedScopeGlobal] Nová žádost o inzerci — ${req.company}`;
  return sendAdOfferViaEngine({
    to: recipient,
    company: req.company,
    subject,
    html: `<h2>Nová žádost o reklamu</h2>${formatRequest(req)}
      <p><a href="${SITE.url.replace(/\/$/, "")}/admin/sales?tab=trziste">Obchodní oddělení</a>
      · <a href="${SITE.url.replace(/\/$/, "")}/admin/ads-requests">Žádosti o reklamu</a></p>`,
    text: `Nová žádost o reklamu od ${req.company} (${req.email})`,
    metadata: { requestId: req.id, company: req.company },
  });
}

export async function sendAdRequestAckToAdvertiser(req: AdsRequestRow) {
  const origin = SITE.url.replace(/\/$/, "");
  return sendAdOfferViaEngine({
    to: req.email,
    company: req.company,
    subject: `Přijali jsme poptávku inzerce — ${req.company}`,
    html: `<p>Dobrý den, ${req.company},</p>
      <p>žádost o inzerci evidujeme. Vedle jednorázové kampaně můžete dát nabídku na
      <a href="${origin}/exchange">tržiště</a> a objednat
      <a href="${origin}/inzerce/pausal">měsíční paušál od 4 900 Kč</a> — poptávky z nemocnic
      dostanete e-mailem, bez provize z obchodu.</p>
      <p>Návod: <a href="${origin}/exchange/navod">${origin}/exchange/navod</a></p>
      <p>Odpovězte na tento e-mail s jakýmkoli dotazem — odpovíme automaticky
      (${marketplaceInboxEmail()}).</p>`,
    text: `Přijali jsme poptávku inzerce. Tržiště: ${origin}/exchange · paušál: ${origin}/inzerce/pausal`,
    metadata: { requestId: req.id, kind: "ads_request_ack" },
  });
}

export async function sendAdApprovalEmail(req: AdsRequestRow, approveUrl: string) {
  const orderUrl = buildCompanyOrderUrl(req.id, req.approval_token);
  const subject = `Schválení reklamy — ${req.company}`;
  const html = `
    <h2>Vaše reklama byla schválena</h2>
    <p>Pro aktivaci dokončete platbu kartou (Stripe) nebo bankovním převodem s QR a variabilním symbolem ${req.variable_symbol ?? "—" }.</p>
    <p><a href="${orderUrl}">Náhled faktury a platba</a></p>
    <p>Nebo rovnou Stripe: <a href="${approveUrl}">Zaplatit kartou</a></p>
    <p>Cena: ${req.price ?? "dle nabídky"} Kč</p>
    <p>Tržiště a poptávky: <a href="${SITE.url.replace(/\/$/, "")}/exchange">/exchange</a></p>
  `;
  return sendAdOfferViaEngine({
    to: req.email,
    company: req.company,
    subject,
    html,
    text: `Reklama schválena. Platba: ${orderUrl} · VS ${req.variable_symbol ?? ""}`,
    metadata: { requestId: req.id },
  });
}

export async function sendAdApprovalLinkToAdmin(req: AdsRequestRow, approveUrl: string) {
  const recipient = getContactRecipient("partner");
  return sendAdOfferViaEngine({
    to: recipient,
    company: req.company,
    subject: `[Admin] Schválit reklamu — ${req.company}`,
    html: `<p>Žádost čeká na schválení.</p><p><a href="${approveUrl}">Schválit a odeslat platební odkaz</a></p>${formatRequest(req)}`,
    text: `Schválit reklamu: ${approveUrl}`,
    metadata: { requestId: req.id },
  });
}

export function buildApprovalUrl(token: string): string {
  const base = SITE.url.replace(/\/$/, "");
  return `${base}/api/ad-approval?token=${encodeURIComponent(token)}`;
}

export function buildPaymentUrl(requestId: string): string {
  const base = SITE.url.replace(/\/$/, "");
  return `${base}/api/ads/checkout?request_id=${encodeURIComponent(requestId)}`;
}

export function buildCompanyOrderUrl(requestId: string, token?: string | null): string {
  const base = SITE.url.replace(/\/$/, "");
  const url = new URL(`${base}/firmy/reklama/objednavka/${requestId}`);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

export async function sendAdDeniedEmail(req: AdsRequestRow, reason: string) {
  return sendAdOfferViaEngine({
    to: req.email,
    company: req.company,
    subject: `Inzerce neschválena — ${req.company}`,
    html: `<p>Vaše kreativa nebyla schválena třemi editory MedScopeGlobal.</p><p>${reason || "Obsah nesplnil právní, bezpečnostní nebo diplomatická pravidla."}</p>`,
    text: `Inzerce neschválena. ${reason}`,
    metadata: { requestId: req.id, decision: "denied" },
  });
}
