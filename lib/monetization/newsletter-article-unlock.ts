import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE } from "@/lib/config/site";
import { buildLocalePath } from "@/lib/i18n/locale-path";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export const NEWSLETTER_ARTICLE_FROM = "nl";
export const NEWSLETTER_ARTICLE_TOKEN_PARAM = "t";

const SLUG_RE = /^[a-zA-Z0-9][a-zA-Z0-9._~-]{0,159}$/;

function normalizeSlug(slug: string | null | undefined): string | null {
  const value = String(slug ?? "").trim();
  if (!SLUG_RE.test(value)) return null;
  return value;
}

function unlockSecret(): string {
  return (
    process.env.NEWSLETTER_UNSUB_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    "vialongevita-unsub"
  );
}

function publicOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/$/, "");
  if (!raw || /localhost|127\.0\.0\.1/i.test(raw)) return "https://medscopeglobal.com";
  return raw;
}

export function newsletterArticleUnlockToken(slug: string): string {
  const normalized = normalizeSlug(slug) ?? String(slug ?? "").trim();
  return createHmac("sha256", unlockSecret())
    .update(`nl:${normalized}`)
    .digest("hex")
    .slice(0, 24);
}

export function verifyNewsletterArticleUnlock(
  slug: string,
  token: string | null | undefined
): boolean {
  if (!token || token.length < 16) return false;
  const expected = newsletterArticleUnlockToken(slug);
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function articleSlugFromHref(href: string): string | null {
  try {
    const url = href.startsWith("http")
      ? new URL(href)
      : new URL(href, "https://medscopeglobal.com");
    const match = url.pathname.match(/\/article\/([^/]+)\/?$/);
    if (!match?.[1]) return null;
    return normalizeSlug(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

/** Append a signed newsletter unlock so magazine meter does not lock the linked article. */
export function withNewsletterArticleUnlock(href: string): string {
  const slug = articleSlugFromHref(href);
  if (!slug) return href;
  try {
    const url = href.startsWith("http")
      ? new URL(href)
      : new URL(href, "https://medscopeglobal.com");
    url.searchParams.set("from", NEWSLETTER_ARTICLE_FROM);
    url.searchParams.set(NEWSLETTER_ARTICLE_TOKEN_PARAM, newsletterArticleUnlockToken(slug));
    if (href.startsWith("http")) return url.toString();
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}

export function absoluteNewsletterHref(href: string | undefined | null, locale: string): string {
  const origin = publicOrigin();
  if (!href || !href.trim()) {
    const path = locale === "cs" ? "/articles" : buildLocalePath(locale, "/articles");
    return `${origin}${path}`;
  }
  const trimmed = href.trim();
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("#")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return withNewsletterArticleUnlock(trimmed);
  }
  const localized = localizePublicHref(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, locale);
  const abs = localized.startsWith("http") ? localized : `${origin}${localized}`;
  return withNewsletterArticleUnlock(abs);
}
