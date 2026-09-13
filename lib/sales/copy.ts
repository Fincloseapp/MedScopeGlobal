import { getLegalEntity } from "@/lib/config/legal-entity";
import { SITE } from "@/lib/config/site";
import { formatSalesCzk } from "@/lib/sales/packages";
import type { SalesPackage } from "@/lib/sales/types";

function baseUrl(): string {
  return SITE.url.replace(/\/$/, "");
}

export function salesTermsUrl(): string {
  return `${baseUrl()}/inzerce/podminky`;
}

export function salesPausalUrl(): string {
  return `${baseUrl()}/inzerce/pausal`;
}

export function salesPrivacyUrl(): string {
  return `${baseUrl()}/privacy`;
}

export function salesUnsubscribeUrl(email: string, token: string): string {
  const url = new URL(`${baseUrl()}/api/sales/unsubscribe`);
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);
  return url.toString();
}

export function salesPortalUrl(token: string): string {
  return `${baseUrl()}/inzerenti/portal?token=${encodeURIComponent(token)}`;
}

export function salesPartnerUrl(slug: string): string {
  return `${baseUrl()}/partneri/${encodeURIComponent(slug)}`;
}

export function salesOfferEmail(input: {
  company: string;
  package: SalesPackage;
  checkoutUrl?: string | null;
  portalUrl?: string | null;
  unsubscribeUrl: string;
  variableSymbol?: string | null;
  invoiceNumber?: string | null;
}) {
  const entity = getLegalEntity();
  const pkg = input.package;
  const subject = `Nabídka měsíční inzerce MedScopeGlobal — ${pkg.name} (${formatSalesCzk(pkg.priceCzkMonth)} / měsíc)`;
  const pay = input.checkoutUrl
    ? `<p><a href="${input.checkoutUrl}">Objednat a zaplatit paušál kartou (Stripe)</a></p>`
    : `<p>Platbu kartou připravíme po odsouhlasení. Můžete odpovědět na tento e-mail.</p>`;
  const vs = input.variableSymbol
    ? `<p>Variabilní symbol pro převod: <strong>${input.variableSymbol}</strong>${
        input.invoiceNumber ? ` · faktura ${input.invoiceNumber}` : ""
      }</p>`
    : "";
  const portal = input.portalUrl
    ? `<p>Portál inzerenta (faktury, poptávky, stav paušálu): <a href="${input.portalUrl}">${input.portalUrl}</a></p>`
    : "";

  const html = `
    <p>Dobrý den, ${input.company},</p>
    <p>
      ozýváme se z obchodního oddělení <strong>${entity.tradeName}</strong>
      (${entity.name}${entity.ico ? `, IČO ${entity.ico}` : ""}).
      Nabízíme měsíční paušál inzerce na medscopeglobal.com — bez skryté reklamy,
      s označením inzerce a s předáním poptávek podle zaplaceného tarifu.
    </p>
    <p><strong>${pkg.name}</strong> — ${formatSalesCzk(pkg.priceCzkMonth)} měsíčně (neplátce DPH).</p>
    <ul>${pkg.features.map((f) => `<li>${f}</li>`).join("")}</ul>
    ${pay}
    ${vs}
    ${portal}
    <p>Ceník a objednávka: <a href="${salesPausalUrl()}">${salesPausalUrl()}</a></p>
    <p>Obchodní podmínky inzerce: <a href="${salesTermsUrl()}">${salesTermsUrl()}</a></p>
    <p>Ochrana osobních údajů: <a href="${salesPrivacyUrl()}">${salesPrivacyUrl()}</a></p>
    <p style="font-size:12px;color:#64748b">
      Jde o obchodní sdělení určené právnické osobě v souvislosti s její profesní činností
      (zájem na B2B inzerci zdravotnických služeb). Pokud si další nabídky nepřejete,
      odhlaste se jedním kliknutím:
      <a href="${input.unsubscribeUrl}">odhlásit obchodní nabídky</a>.
    </p>
    <p>${entity.name}<br>${entity.supportEmail}${entity.supportPhone ? `<br>${entity.supportPhone}` : ""}</p>
  `;
  const text = [
    `Nabídka ${pkg.name} — ${formatSalesCzk(pkg.priceCzkMonth)} / měsíc.`,
    salesPausalUrl(),
    `Odhlášení: ${input.unsubscribeUrl}`,
  ].join("\n");
  return { subject, html, text };
}

export function salesInvoiceEmailIntro(company: string, number: string, vs: string, amount: number) {
  return {
    subject: `Faktura ${number} — MedScopeGlobal inzerce`,
    text: `Faktura ${number} na ${formatSalesCzk(amount)}. Variabilní symbol ${vs}.`,
    leadHtml: `<p>Dobrý den, ${company},</p><p>v příloze / níže je faktura <strong>${number}</strong> za měsíční paušál inzerce. Variabilní symbol <strong>${vs}</strong>.</p>`,
  };
}

export function salesInquiryForwardEmail(input: {
  advertiser: string;
  senderName: string;
  senderEmail: string;
  message: string;
  landingUrl: string;
}) {
  const subject = `Poptávka z MedScopeGlobal — ${input.advertiser}`;
  const html = `
    <p>Nová poptávka na váš inzertní profil.</p>
    <p><strong>Od:</strong> ${input.senderName} (${input.senderEmail})</p>
    <p><strong>Profil:</strong> <a href="${input.landingUrl}">${input.landingUrl}</a></p>
    <p>${input.message.replace(/\n/g, "<br>")}</p>
    <p style="font-size:12px;color:#64748b">Poptávka je plněním paušálu, který máte zaplacený. Odpovězte odesílateli přímo.</p>
  `;
  return { subject, html, text: `${input.senderName} <${input.senderEmail}>\n\n${input.message}` };
}

export function salesDunningEmail(company: string, number: string, vs: string, amount: number, checkoutUrl?: string | null) {
  const pay = checkoutUrl ? `<p><a href="${checkoutUrl}">Zaplatit kartou</a></p>` : "";
  return {
    subject: `Připomínka úhrady ${number} — MedScopeGlobal`,
    html: `<p>Dobrý den, ${company},</p><p>faktura ${number} na ${formatSalesCzk(amount)} (VS ${vs}) je po splatnosti. Do doby úhrady můžeme paušál pozastavit.</p>${pay}`,
    text: `Faktura ${number} VS ${vs} — ${formatSalesCzk(amount)} po splatnosti.`,
  };
}