import { getLatestNewsletter, type NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";

export const V22_NEWSLETTER_HERO = V23_NEWSLETTER_IMAGE;

export const V22_FALLBACK_NEWSLETTER: NewsletterRow = {
  id: "curated-newsletter-2026-06",
  title: "MedScopeGlobal Newsletter — 10. června 2026",
  slug: "medscope-prehled-cerven-2026",
  issue_date: "2026-06-10",
  html_content: `
    <article>
      <h2>Vítejte v odborném přehledu MedScope</h2>
      <p>Český medicínský newsletter 2× měsíčně — studie, legislativa, lékové novinky a digitální zdravotnictví.</p>
      <h3>Studie</h3>
      <p>Nejnovější revmatologické RCT a meta-analýzy s českým shrnutím a klinickým dopadem.</p>
      <h3>Legislativa</h3>
      <p>Přehled změn MZČR, SÚKL a úhradových mechanismů relevantních pro praxi.</p>
      <h3>Léky</h3>
      <p>Registrace a bezpečnostní signály z SÚKL a EMA.</p>
      <h3>Digitální zdravotnictví</h3>
      <p>Telemedicína, AI ve zdravotnictví a eHealth strategie ČR.</p>
      <p><em>Přihlaste se k odběru na stránce Předplatné.</em></p>
    </article>
  `,
  pdf_text:
    "MedScopeGlobal Newsletter — 10. června 2026\n\nStudie, legislativa, léky, digital health.\nPřihlášení k odběru: medscopeglobal.com/subscribe",
  pdf_url: null,
  layout_json: null,
  published: true,
  admin_only: false,
  created_at: new Date().toISOString(),
};

export async function getV22LatestNewsletter(): Promise<NewsletterRow> {
  const db = await getLatestNewsletter();
  return db ?? V22_FALLBACK_NEWSLETTER;
}
