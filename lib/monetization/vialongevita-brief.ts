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
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { getDefaultFromEmail } from "@/lib/email/from";
import { isCloudflareEmailConfigured } from "@/lib/email/cloudflare-sending";
import { looksLikeCzech } from "@/lib/i18n/czech-detect";
import {
  affiliateRowHtml,
  briefInnerHtml,
  emailShell,
  welcomeInnerHtml,
  type BriefArticle,
} from "@/lib/monetization/brief-email-layout";
import { briefChrome } from "@/lib/monetization/brief-marketing";

export type { BriefArticle };

const FROM_NAME = MAGAZINE.name;
const WEEK_MS = 6 * 24 * 60 * 60 * 1000;
const BATCH_CAP = 80;

export type BriefSendResult = {
  ok: boolean;
  dryRun: boolean;
  locales: Record<string, number>;
  sent: number;
  skipped: number;
  errors: string[];
};

export function mailReady(): boolean {
  return isCloudflareEmailConfigured() || isSendGridConfigured() || isSmtpConfigured();
}

export function mailTransportLabel(): "cloudflare" | "sendgrid" | "smtp" | "none" {
  if (isCloudflareEmailConfigured()) return "cloudflare";
  if (isSendGridConfigured()) return "sendgrid";
  if (isSmtpConfigured()) return "smtp";
  return "none";
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

function magazineHome(locale: string): string {
  return `${SITE.url}${buildLocalePath(locale, "/")}`;
}

function articleHref(locale: string, slug: string): string {
  if (slug.startsWith("__pillar")) {
    return `${SITE.url}${buildLocalePath(locale, "/verejnost/clanky")}`;
  }
  return `${SITE.url}${buildLocalePath(locale, `/article/${slug}`)}`;
}

function pillarBriefArticles(locale: string): BriefArticle[] {
  const copy = getNewsletterCopy(locale);
  return [
    {
      slug: "__pillar_1",
      title: copy.hubPillar1Title,
      excerpt: copy.hubPillar1Body,
      locale,
      public_topic: "zivotni-styl",
    },
    {
      slug: "__pillar_2",
      title: copy.hubPillar2Title,
      excerpt: copy.hubPillar2Body,
      locale,
      public_topic: "prevence",
    },
    {
      slug: "__pillar_3",
      title: copy.hubPillar3Title,
      excerpt: copy.hubPillar3Body,
      locale,
      public_topic: "dlouhovekost",
    },
  ];
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
  }).slice(0, 2);
}

function briefHtml(locale: string, email: string, articles: BriefArticle[]): { subject: string; html: string; text: string } {
  const products = pickBriefProducts(articles, locale);
  const affiliateHtml = affiliateRowHtml(products, locale, (product) =>
    `${SITE.url}${affiliateGoPath(product.id, locale, { carryLocale: true })}`
  );
  return briefInnerHtml({
    locale,
    emailUnsub: newsletterUnsubUrl(email, locale),
    articles,
    articleHref: (slug) => articleHref(locale, slug),
    affiliateHtml,
  });
}

export async function sendViaLongeVitaWelcome(input: {
  email: string;
  locale: string;
}): Promise<boolean> {
  if (!mailReady()) return false;
  if (skipAddress(input.email)) return false;
  const copy = getNewsletterCopy(input.locale);
  const chrome = briefChrome(input.locale);
  const inner = welcomeInnerHtml({
    locale: input.locale,
    home: magazineHome(input.locale),
    unsub: newsletterUnsubUrl(input.email, input.locale),
  });
  const { html, text } = emailShell({
    locale: input.locale,
    inner,
    preheader: chrome.welcomeExpect,
    kicker: chrome.welcomeKicker,
  });
  const result = await sendEmail({
    to: input.email,
    subject: copy.welcomeSubject,
    html,
    text,
    category: "marketing",
    fromName: FROM_NAME,
    fromEmail: getDefaultFromEmail(),
    metadata: { kind: "vialongevita-welcome", locale: input.locale },
  });
  return result.ok;
}

export async function sendViaLongeVitaFirstBrief(input: {
  email: string;
  locale?: string;
  force?: boolean;
}): Promise<{ ok: boolean; error?: string; usedFallback?: boolean; skipped?: boolean }> {
  if (!mailReady()) return { ok: false, error: "mail_not_configured" };
  if (skipAddress(input.email)) return { ok: false, error: "skip_address" };
  const locale = (input.locale ?? "cs").trim() || "cs";
  const email = input.email.trim().toLowerCase();
  const admin = tryCreateServiceRoleClient();
  if (admin && !input.force) {
    const { data } = await admin
      .from("newsletter_subscribers")
      .select("last_brief_sent_at")
      .eq("email", email)
      .eq("segment", "public")
      .is("unsubscribed_at", null)
      .maybeSingle();
    if (data?.last_brief_sent_at) {
      return { ok: true, skipped: true };
    }
  }
  const live = await loadBriefArticles(locale);
  const usedFallback = live.length === 0;
  const articles = usedFallback ? pillarBriefArticles(locale) : live;
  const payload = briefHtml(locale, email, articles);
  const result = await sendEmail({
    to: email,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    category: "marketing",
    fromName: FROM_NAME,
    fromEmail: getDefaultFromEmail(),
    metadata: { kind: "vialongevita-brief-first", locale, usedFallback },
  });
  if (!result.ok) return { ok: false, error: result.error ?? "send_failed", usedFallback };

  if (admin) {
    await admin
      .from("newsletter_subscribers")
      .update({ last_brief_sent_at: new Date().toISOString() })
      .eq("email", email)
      .eq("segment", "public")
      .is("unsubscribed_at", null);
  }
  return { ok: true, usedFallback };
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
    if (primary === "pt-BR") {
      return articleLocale.startsWith("pt-br") || articleLocale === "pt-BR";
    }
    if (primary === "pt") {
      return articleLocale === "pt" || articleLocale.startsWith("pt-pt");
    }
    if (articleLocale.startsWith(primary)) return true;
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
  const live = await loadBriefArticles(locale);
  const articles = live.length ? live : pillarBriefArticles(locale);
  const payload = briefHtml(locale, input.email, articles);
  const result = await sendEmail({
    to: input.email,
    subject: `[test] ${payload.subject}`,
    html: payload.html,
    text: payload.text,
    category: "marketing",
    fromName: FROM_NAME,
    fromEmail: getDefaultFromEmail(),
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
    const live = articleCache.get(locale) ?? [];
    const articles = live.length ? live : pillarBriefArticles(locale);
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
      fromEmail: getDefaultFromEmail(),
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
