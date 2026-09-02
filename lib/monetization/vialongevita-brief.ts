import { createHmac } from "node:crypto";
import { MAGAZINE } from "@/lib/brand/magazine";
import { SITE } from "@/lib/config/site";
import { sendEmail } from "@/lib/email/engine";
import { isSendGridConfigured } from "@/lib/email/sendgrid";
import { isSmtpConfigured } from "@/lib/email/smtp";
import { isLongevityArticle } from "@/lib/v271/news-desks";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { buildLocalePath } from "@/lib/i18n/locale-path";
import { normalizeLocale } from "@/lib/i18n/config";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { applyNewsletterSubscriberSchema } from "@/lib/monetization/apply-schema";
import { affiliateGoPath } from "@/lib/monetization/affiliate-geo";
import { pickAffiliateProducts } from "@/lib/monetization/affiliate-mix";
import type { AffiliateProduct } from "@/lib/ecosystem/monetization";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { composeBriefLead, composeBriefSubject } from "@/lib/monetization/brief-marketing";
import { looksLikeCzech } from "@/lib/i18n/czech-detect";

const FROM_NAME = MAGAZINE.name;
const WEEK_MS = 6 * 24 * 60 * 60 * 1000;
const BATCH_CAP = 80;

export type BriefArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  locale: string | null;
  public_topic: string | null;
};

export type BriefSendResult = {
  ok: boolean;
  dryRun: boolean;
  locales: Record<string, number>;
  sent: number;
  skipped: number;
  errors: string[];
};

function mailReady(): boolean {
  return isSendGridConfigured() || isSmtpConfigured();
}

function skipAddress(email: string): boolean {
  const e = email.toLowerCase();
  if (e.startsWith("ops-auto")) return true;
  if (e.includes("+test@")) return true;
  if (e.endsWith("@example.com") || e.endsWith("@example.org")) return true;
  if (e.endsWith("@mailinator.com")) return true;
  return false;
}

export function newsletterUnsubSecret(): string {
  return (
    process.env.NEWSLETTER_UNSUB_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    "vialongevita-unsub"
  );
}

export function newsletterUnsubToken(email: string): string {
  return createHmac("sha256", newsletterUnsubSecret())
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 24);
}

export function newsletterUnsubUrl(email: string, locale: string): string {
  const token = newsletterUnsubToken(email);
  const params = new URLSearchParams({
    email,
    token,
    locale,
  });
  return `${SITE.url}/api/newsletter/unsubscribe?${params.toString()}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function magazineHome(locale: string): string {
  return `${SITE.url}${buildLocalePath(locale, "/")}`;
}

function articleHref(locale: string, slug: string): string {
  return `${SITE.url}${buildLocalePath(locale, `/article/${slug}`)}`;
}

function productLabel(product: AffiliateProduct, locale: string): { name: string; description: string } {
  const primary = primaryArticleLocale(normalizeLocale(locale));
  const name =
    product.name[locale] ?? product.name[primary] ?? product.name.en ?? product.name.cs ?? product.id;
  const description =
    product.description[locale] ??
    product.description[primary] ??
    product.description.en ??
    product.description.cs ??
    "";
  return { name, description };
}

function productImageUrl(product: AffiliateProduct): string {
  if (product.imageUrl.startsWith("http")) return product.imageUrl;
  return `${SITE.url}${product.imageUrl}`;
}

function affiliateCardHtml(product: AffiliateProduct, locale: string, cta: string): string {
  const label = productLabel(product, locale);
  const go = `${SITE.url}${affiliateGoPath(product.id, locale, { carryLocale: true })}`;
  const image = productImageUrl(product);
  return `<td style="width:33%;padding:0 6px 8px;vertical-align:top;">
    <a href="${escapeHtml(go)}" style="display:block;text-decoration:none;color:#021d33;">
      <img src="${escapeHtml(image)}" alt="" width="160" height="200" style="display:block;width:100%;height:auto;border-radius:12px;border:1px solid #cfe1f3;background:#e8f3fb;" />
      <p style="margin:10px 0 4px;font-size:14px;font-weight:600;line-height:1.3;">${escapeHtml(label.name)}</p>
      <p style="margin:0 0 8px;font-size:12px;line-height:1.4;color:#475569;">${escapeHtml(label.description)}</p>
      <span style="font-size:12px;color:#005B96;">${escapeHtml(cta)} →</span>
    </a>
  </td>`;
}

function emailShell(locale: string, inner: string): { html: string; text: string } {
  const copy = getNewsletterCopy(locale);
  const html = `<!doctype html>
<html lang="${escapeHtml(locale)}">
<body style="margin:0;background:#f4f7fb;font-family:Georgia,serif;color:#021d33;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #cfe1f3;">
        <tr><td style="background:#021d33;padding:20px 28px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9ec9ea;">${escapeHtml(copy.kicker)}</p>
          <p style="margin:6px 0 0;font-size:22px;color:#ffffff;">${escapeHtml(MAGAZINE.name)}</p>
        </td></tr>
        <tr><td style="padding:28px;">${inner}</td></tr>
        <tr><td style="padding:0 28px 24px;font-size:12px;line-height:1.6;color:#64748b;">
          <p style="margin:0;">${escapeHtml(copy.footer)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { html, text };
}

export async function sendViaLongeVitaWelcome(input: {
  email: string;
  locale: string;
}): Promise<boolean> {
  if (!mailReady()) return false;
  if (skipAddress(input.email)) return false;
  const copy = getNewsletterCopy(input.locale);
  const home = magazineHome(input.locale);
  const unsub = newsletterUnsubUrl(input.email, input.locale);
  const welcomeProducts = pickAffiliateProducts({
    surface: "newsletter",
    locale: input.locale,
  }).slice(0, 2);
  const welcomeCards = welcomeProducts
    .map((product) => affiliateCardHtml(product, input.locale, copy.briefAffiliateCta))
    .join("");
  const inner = `
    <p style="margin:0 0 12px;font-size:18px;">${escapeHtml(copy.welcomeIntro)}</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(copy.welcomeBody)}</p>
    <p style="margin:0 0 24px;">
      <a href="${escapeHtml(home)}" style="display:inline-block;background:#005B96;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;">${escapeHtml(copy.welcomeCta)}</a>
    </p>
    ${
      welcomeCards
        ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#005B96;">${escapeHtml(copy.briefAffiliateKicker)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr>${welcomeCards}</tr></table>`
        : ""
    }
    <p style="margin:0;font-size:12px;color:#64748b;">
      <a href="${escapeHtml(unsub)}" style="color:#64748b;">${escapeHtml(copy.unsub)}</a>
    </p>`;
  const { html, text } = emailShell(input.locale, inner);
  const result = await sendEmail({
    to: input.email,
    subject: copy.welcomeSubject,
    html,
    text,
    category: "marketing",
    fromName: FROM_NAME,
    metadata: { kind: "vialongevita-welcome", locale: input.locale },
  });
  return result.ok;
}

function pickBriefProducts(articles: BriefArticle[], locale: string) {
  return pickAffiliateProducts({
    surface: "newsletter",
    locale,
    article: {
      title: articles.map((a) => a.title).join(" "),
      excerpt: articles.map((a) => a.excerpt ?? "").join(" "),
      slug: articles.map((a) => a.slug).join(" "),
      public_topic: articles.map((a) => a.public_topic ?? "").join(" "),
    },
  });
}

function briefHtml(locale: string, email: string, articles: BriefArticle[]): { subject: string; html: string; text: string } {
  const copy = getNewsletterCopy(locale);
  const products = pickBriefProducts(articles, locale);
  const cards = products.map((product) => affiliateCardHtml(product, locale, copy.briefAffiliateCta)).join("");
  const unsub = newsletterUnsubUrl(email, locale);
  const titles = articles.map((article) => article.title);
  const lead = composeBriefLead(locale, titles);

  const items = articles
    .map((article) => {
      const href = articleHref(locale, article.slug);
      const excerpt = article.excerpt ? `<p style="margin:6px 0 0;font-size:14px;color:#475569;">${escapeHtml(article.excerpt)}</p>` : "";
      return `<tr><td style="padding:0 0 16px;">
        <a href="${escapeHtml(href)}" style="color:#005B96;font-size:16px;text-decoration:none;font-weight:600;">${escapeHtml(article.title)}</a>
        ${excerpt}
      </td></tr>`;
    })
    .join("");

  const inner = `
    <p style="margin:0 0 18px;font-size:16px;line-height:1.55;">${escapeHtml(lead)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>
    <div style="margin:8px 0 20px;padding:16px;border:1px solid #cfe1f3;background:#f4f8fc;border-radius:12px;">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#005B96;">${escapeHtml(copy.briefAffiliateKicker)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cards}</tr></table>
    </div>
    <p style="margin:0;font-size:12px;color:#64748b;">
      <a href="${escapeHtml(unsub)}" style="color:#64748b;">${escapeHtml(copy.unsub)}</a>
    </p>`;
  const { html, text } = emailShell(locale, inner);
  return { subject: composeBriefSubject(locale, titles), html, text };
}

async function loadBriefArticles(locale: string): Promise<BriefArticle[]> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("articles")
    .select("slug, title, excerpt, locale, public_topic, published_at, published, vip_only, min_access_level")
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);

  if (error || !data) return [];

  const primary = primaryArticleLocale(normalizeLocale(locale));
  const rows = (data as BriefArticle[]).filter((row) => {
    if (!row.slug || !row.title) return false;
    const articleLocale = (row.locale ?? "").toLowerCase();
    if (primary === "cs") {
      return !articleLocale || articleLocale.startsWith("cs");
    }
    if (articleLocale.startsWith(primary) || articleLocale.startsWith("en")) return true;
    return false;
  });

  const longevity = rows.filter((row) =>
    isLongevityArticle({
      title: row.title,
      excerpt: row.excerpt,
      slug: row.slug,
      public_topic: row.public_topic,
    })
  );
  const picked = (longevity.length >= 3 ? longevity : rows).slice(0, 3);
  return localizeBriefArticles(picked, locale);
}

async function localizeBriefArticles(articles: BriefArticle[], locale: string): Promise<BriefArticle[]> {
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (primary === "cs") return articles;
  const { fallbackTranslateFields } = await import("@/lib/i18n/translate-fallback");
  const localized: BriefArticle[] = [];
  for (const row of articles) {
    if (!looksLikeCzech(row.title) && !looksLikeCzech(row.excerpt ?? "")) {
      localized.push(row);
      continue;
    }
    const hit = await fallbackTranslateFields({
      title: row.title,
      excerpt: row.excerpt,
      content: row.excerpt ?? undefined,
      sourceLocale: "cs",
      targetLocale: normalizeLocale(locale),
      mode: "card",
    }).catch(() => null);
    if (!hit || looksLikeCzech(hit.title)) continue;
    localized.push({
      ...row,
      title: hit.title,
      excerpt: hit.excerpt && !looksLikeCzech(hit.excerpt) ? hit.excerpt : null,
    });
  }
  return localized;
}

export async function sendViaLongeVitaTestBrief(input: {
  email: string;
  locale?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!mailReady()) return { ok: false, error: "mail_not_configured" };
  if (skipAddress(input.email)) return { ok: false, error: "skip_address" };
  const locale = (input.locale ?? "cs").trim() || "cs";
  const articles = await loadBriefArticles(locale);
  if (articles.length === 0) return { ok: false, error: "no_articles" };
  const payload = briefHtml(locale, input.email, articles);
  const result = await sendEmail({
    to: input.email,
    subject: `[test] ${payload.subject}`,
    html: payload.html,
    text: payload.text,
    category: "marketing",
    fromName: FROM_NAME,
    metadata: { kind: "vialongevita-brief-test", locale },
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error ?? "send_failed" };
}

type SubscriberRow = {
  id: string;
  email: string;
  locale: string | null;
  last_brief_sent_at: string | null;
  unsubscribed_at: string | null;
};

export async function sendViaLongeVitaWeeklyBrief(options?: {
  dryRun?: boolean;
  force?: boolean;
  limit?: number;
}): Promise<BriefSendResult> {
  await applyNewsletterSubscriberSchema();
  const dryRun = Boolean(options?.dryRun);
  const force = Boolean(options?.force);
  const limit = Math.min(options?.limit ?? BATCH_CAP, 200);
  const errors: string[] = [];
  const locales: Record<string, number> = {};
  let sent = 0;
  let skipped = 0;

  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { ok: false, dryRun, locales, sent, skipped, errors: ["no_service_role"] };
  }
  if (!dryRun && !mailReady()) {
    return { ok: false, dryRun, locales, sent, skipped, errors: ["mail_not_configured"] };
  }

  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select("id, email, locale, last_brief_sent_at, unsubscribed_at")
    .eq("segment", "public")
    .order("created_at", { ascending: true })
    .limit(400);

  if (error) {
    return { ok: false, dryRun, locales, sent, skipped, errors: [error.message] };
  }

  const now = Date.now();
  const due = ((data ?? []) as SubscriberRow[]).filter((row) => {
    if (row.unsubscribed_at) return false;
    if (skipAddress(row.email)) return false;
    if (force) return true;
    if (!row.last_brief_sent_at) return true;
    return now - new Date(row.last_brief_sent_at).getTime() >= WEEK_MS;
  });

  const articleCache = new Map<string, BriefArticle[]>();
  for (const row of due.slice(0, limit)) {
    const locale = (row.locale ?? "en").trim() || "en";
    locales[locale] = (locales[locale] ?? 0) + 1;
    if (!articleCache.has(locale)) {
      articleCache.set(locale, await loadBriefArticles(locale));
    }
    const articles = articleCache.get(locale) ?? [];
    if (articles.length === 0) {
      skipped += 1;
      continue;
    }
    if (dryRun) {
      sent += 1;
      continue;
    }
    const payload = briefHtml(locale, row.email, articles);
    const result = await sendEmail({
      to: row.email,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      category: "marketing",
      fromName: FROM_NAME,
      metadata: { kind: "vialongevita-brief", locale },
    });
    if (!result.ok) {
      errors.push(`${row.email}: ${result.error ?? "send_failed"}`);
      continue;
    }
    const { error: stampError } = await admin
      .from("newsletter_subscribers")
      .update({ last_brief_sent_at: new Date().toISOString() })
      .eq("id", row.id);
    if (stampError && /last_brief_sent_at/i.test(stampError.message)) {
      errors.push("missing_last_brief_sent_at");
    }
    sent += 1;
  }

  skipped += Math.max(0, due.length - limit);
  return {
    ok: errors.length === 0,
    dryRun,
    locales,
    sent,
    skipped,
    errors: errors.slice(0, 12),
  };
}
