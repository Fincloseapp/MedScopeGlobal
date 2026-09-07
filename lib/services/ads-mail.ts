import { SITE } from "@/lib/config/site";
import { sendContactEmail, getContactRecipient } from "@/lib/services/contact-mail";
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
  const recipient = getContactRecipient("general");
  const subject = `[MedScopeGlobal] Nová žádost o inzerci — ${req.company}`;

  return sendContactEmail({
    kind: "partner",
    recipient,
    subject,
    html: `<h2>Nová žádost o reklamu</h2>${formatRequest(req)}`,
    text: `Nová žádost o reklamu od ${req.company} (${req.email})`,
    payload: { requestId: req.id, company: req.company },
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
  `;

  return sendContactEmail({
    kind: "partner",
    recipient: req.email,
    subject,
    html,
    text: `Reklama schválena. Platba: ${orderUrl} · VS ${req.variable_symbol ?? ""}`,
    payload: { requestId: req.id },
  });
}

export async function sendAdApprovalLinkToAdmin(req: AdsRequestRow, approveUrl: string) {
  const recipient = getContactRecipient("partner");
  return sendContactEmail({
    kind: "partner",
    recipient,
    subject: `[Admin] Schválit reklamu — ${req.company}`,
    html: `<p>Žádost čeká na schválení.</p><p><a href="${approveUrl}">Schválit a odeslat platební odkaz</a></p>${formatRequest(req)}`,
    text: `Schválit reklamu: ${approveUrl}`,
    payload: { requestId: req.id },
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
  return sendContactEmail({
    kind: "partner",
    recipient: req.email,
    subject: `Inzerce neschválena — ${req.company}`,
    html: `<p>Vaše kreativa nebyla schválena třemi editory MedScopeGlobal.</p><p>${reason || "Obsah nesplnil právní, bezpečnostní nebo diplomatická pravidla."}</p>`,
    text: `Inzerce neschválena. ${reason}`,
    payload: { requestId: req.id, decision: "denied" },
  });
}
