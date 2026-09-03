import { MAGAZINE } from "@/lib/brand/magazine";
import { SITE } from "@/lib/config/site";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { briefChrome, composeBriefLead, composeBriefPreheader, composeBriefSubject } from "@/lib/monetization/brief-marketing";
import type { AffiliateProduct } from "@/lib/ecosystem/monetization";

export type BriefArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  locale: string | null;
  public_topic: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function magazineLockupUrl(): string {
  return `${SITE.url}${MAGAZINE.emailLockup}`;
}

const NAVY = "#021d33";
const BLUE = "#005B96";
const MUTED = "#64748b";
const BODY = "#334155";
const RULE = "#d5e4f0";

export function emailShell(input: {
  locale: string;
  inner: string;
  preheader: string;
  kicker?: string;
}): { html: string; text: string } {
  const copy = getNewsletterCopy(input.locale);
  const chrome = briefChrome(input.locale);
  const lockup = magazineLockupUrl();
  const kicker = input.kicker ?? chrome.edition;
  const html = `<!doctype html>
<html lang="${escapeHtml(input.locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <title>${escapeHtml(MAGAZINE.name)}</title>
</head>
<body style="margin:0;padding:0;background:#e8eef4;font-family:Georgia,'Times New Roman',serif;color:${NAVY};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(input.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8eef4;padding:24px 8px 40px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:6px;overflow:hidden;border:1px solid ${RULE};">
        <tr>
          <td align="center" style="background:${NAVY};padding:0;line-height:0;">
            <a href="${escapeHtml(SITE.url)}" style="text-decoration:none;border:0;">
              <img src="${escapeHtml(lockup)}" alt="${escapeHtml(MAGAZINE.name)}" width="600" height="170" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;" />
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="background:${NAVY};padding:0 28px 18px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9ec9ea;">${escapeHtml(kicker)}</p>
          </td>
        </tr>
        <tr><td style="padding:32px 28px 12px;">${input.inner}</td></tr>
        <tr>
          <td style="padding:4px 28px 0;">
            <div style="border-top:1px solid ${RULE};"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.65;color:${MUTED};">
            <p style="margin:0 0 8px;">${escapeHtml(copy.footer)}</p>
            <p style="margin:0;color:#94a3b8;">${escapeHtml(chrome.brandLine)}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = `${MAGAZINE.name} — ${kicker}\n\n${input.preheader}\n\n${input.inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`;
  return { html, text };
}

function productLabel(product: AffiliateProduct, locale: string): { name: string; description: string } {
  const name = product.name[locale] ?? product.name.en ?? product.name.cs ?? product.id;
  const description =
    product.description[locale] ?? product.description.en ?? product.description.cs ?? "";
  return { name, description };
}

export function affiliateRowHtml(
  products: AffiliateProduct[],
  locale: string,
  hrefFor: (product: AffiliateProduct) => string
): string {
  if (!products.length) return "";
  const copy = getNewsletterCopy(locale);
  const chrome = briefChrome(locale);
  const rows = products.slice(0, 2).map((product) => {
    const label = productLabel(product, locale);
    const go = hrefFor(product);
    const image = product.imageUrl.startsWith("http") ? product.imageUrl : `${SITE.url}${product.imageUrl}`;
    return `<tr>
      <td style="padding:0 0 14px;vertical-align:top;width:72px;">
        <a href="${escapeHtml(go)}" style="text-decoration:none;">
          <img src="${escapeHtml(image)}" alt="" width="64" height="80" style="display:block;border-radius:8px;border:1px solid ${RULE};background:#f4f8fc;" />
        </a>
      </td>
      <td style="padding:0 0 14px 12px;vertical-align:top;">
        <a href="${escapeHtml(go)}" style="text-decoration:none;color:${NAVY};">
          <p style="margin:0 0 4px;font-size:15px;font-weight:600;line-height:1.3;">${escapeHtml(label.name)}</p>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.45;color:#475569;">${escapeHtml(label.description)}</p>
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BLUE};">${escapeHtml(copy.briefAffiliateCta)} →</span>
        </a>
      </td>
    </tr>`;
  }).join("");
  return `<div style="margin:28px 0 8px;padding:18px 16px 8px;background:#f7fafc;border:1px solid ${RULE};border-radius:12px;">
    <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${BLUE};">${escapeHtml(copy.briefAffiliateKicker)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <p style="margin:4px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#94a3b8;">${escapeHtml(chrome.disclosure)}</p>
  </div>`;
}

export function welcomeInnerHtml(input: {
  locale: string;
  home: string;
  unsub: string;
}): string {
  const copy = getNewsletterCopy(input.locale);
  const chrome = briefChrome(input.locale);
  return `
    <p style="margin:0 0 12px;font-size:24px;line-height:1.28;color:${NAVY};">${escapeHtml(copy.welcomeIntro)}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:${BODY};">${escapeHtml(copy.welcomeBody)}</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:${BLUE};">${escapeHtml(chrome.welcomeExpect)}</p>
    <p style="margin:0 0 28px;">
      <a href="${escapeHtml(input.home)}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:14px;letter-spacing:0.02em;">${escapeHtml(copy.welcomeCta)}</a>
    </p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};">
      <a href="${escapeHtml(input.unsub)}" style="color:${MUTED};">${escapeHtml(copy.unsub)}</a>
    </p>`;
}

export function briefInnerHtml(input: {
  locale: string;
  emailUnsub: string;
  articles: BriefArticle[];
  articleHref: (slug: string) => string;
  affiliateHtml: string;
}): { subject: string; html: string; text: string } {
  const copy = getNewsletterCopy(input.locale);
  const chrome = briefChrome(input.locale);
  const titles = input.articles.map((article) => article.title);
  const lead = composeBriefLead(input.locale, titles);
  const dateLabel = formatPublicDate(new Date().toISOString().slice(0, 10), input.locale) ?? "";
  const kicker = dateLabel ? `${chrome.edition} · ${dateLabel}` : chrome.edition;
  const [hero, ...rest] = input.articles;

  const heroBlock = hero
    ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${BLUE};">01 · ${escapeHtml(chrome.heroLabel)}</p>
    <p style="margin:0 0 12px;font-size:24px;line-height:1.28;color:${NAVY};">
      <a href="${escapeHtml(input.articleHref(hero.slug))}" style="color:${NAVY};text-decoration:none;">${escapeHtml(hero.title)}</a>
    </p>
    ${hero.excerpt ? `<p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#475569;">${escapeHtml(hero.excerpt)}</p>` : ""}
    <p style="margin:0 0 28px;">
      <a href="${escapeHtml(input.articleHref(hero.slug))}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:14px;">${escapeHtml(chrome.readStory)}</a>
    </p>`
    : "";

  const more =
    rest.length > 0
      ? `<p style="margin:4px 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${BLUE};">${escapeHtml(chrome.moreThisWeek)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rest
      .map((article, index) => {
        const n = String(index + 2).padStart(2, "0");
        const excerpt = article.excerpt
          ? `<p style="margin:6px 0 0;font-size:14px;line-height:1.55;color:#475569;">${escapeHtml(article.excerpt)}</p>`
          : "";
        return `<tr><td style="padding:0 0 18px;border-top:1px solid #e6eef5;">
          <p style="margin:14px 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;color:#94a3b8;">${n}</p>
          <a href="${escapeHtml(input.articleHref(article.slug))}" style="color:${NAVY};font-size:18px;line-height:1.35;text-decoration:none;font-weight:600;">${escapeHtml(article.title)}</a>
          ${excerpt}
        </td></tr>`;
      })
      .join("")}</table>`
      : "";

  const inner = `
    <p style="margin:0 0 26px;font-size:17px;line-height:1.65;color:${BODY};">${escapeHtml(lead)}</p>
    ${heroBlock}
    ${more}
    ${input.affiliateHtml}
    <p style="margin:22px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};">
      <a href="${escapeHtml(input.emailUnsub)}" style="color:${MUTED};">${escapeHtml(copy.unsub)}</a>
    </p>`;
  const { html, text } = emailShell({
    locale: input.locale,
    inner,
    preheader: composeBriefPreheader(input.locale, titles),
    kicker,
  });
  return { subject: composeBriefSubject(input.locale, titles), html, text };
}
