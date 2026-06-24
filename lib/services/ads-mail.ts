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
  const subject = `Schválení reklamy — ${req.company}`;
  const html = `
    <h2>Vaše reklama byla schválena</h2>
    <p>Pro aktivaci dokončete platbu:</p>
    <p><a href="${approveUrl}">Přejít na platbu (Stripe)</a></p>
    <p>Cena: ${req.price ?? "dle nabídky"} Kč</p>
  `;

  return sendContactEmail({
    kind: "partner",
    recipient: req.email,
    subject,
    html,
    text: `Reklama schválena. Platba: ${approveUrl}`,
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
