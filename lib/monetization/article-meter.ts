import { resolveLocalePath } from "@/lib/i18n/locale-path";

export const ARTICLE_METER_COOKIE = "ms_article_meter";
export const ARTICLE_METER_HEADER = "x-ms-article-meter";
export const ARTICLE_METER_MAX_AGE_SEC = 60 * 60 * 24 * 30;
export const ARTICLE_METER_MAX_SLUGS = 40;

export type ArticleMeterRoll = "free" | "lock";

export type ArticleMeterState = {
  v: 1;
  opened: string[];
  secondRoll?: ArticleMeterRoll;
};

export type ArticleMeterDecision = {
  state: ArticleMeterState;
  unlocked: boolean;
  index: number;
};

const SLUG_RE = /^[a-zA-Z0-9][a-zA-Z0-9._~-]{0,159}$/;

const SKIP_PREFIXES = [
  "/lekari/",
  "/studenti/",
  "/academy/",
  "/app/",
  "/admin/",
  "/api/",
];

export function normalizeMeterSlug(slug: string | null | undefined): string | null {
  const value = String(slug ?? "").trim();
  if (!SLUG_RE.test(value)) return null;
  if (value.toLowerCase().startsWith("zpravy-")) return null;
  return value;
}

export function parseArticleMeter(raw: string | null | undefined): ArticleMeterState {
  const empty: ArticleMeterState = { v: 1, opened: [] };
  if (!raw) return empty;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  if (decoded.startsWith("{")) {
    try {
      const json = JSON.parse(decoded) as Partial<ArticleMeterState>;
      const opened = Array.isArray(json.opened)
        ? json.opened
            .map((item) => normalizeMeterSlug(String(item)))
            .filter((item): item is string => Boolean(item))
            .slice(-ARTICLE_METER_MAX_SLUGS)
        : [];
      const secondRoll = json.secondRoll === "free" || json.secondRoll === "lock" ? json.secondRoll : undefined;
      return { v: 1, opened, secondRoll };
    } catch {
      return empty;
    }
  }

  const match = decoded.match(/^1:([^:]*)(?::([fl]))?$/);
  if (!match) return empty;
  const opened = match[1]
    .split(",")
    .map((item) => normalizeMeterSlug(item))
    .filter((item): item is string => Boolean(item))
    .slice(-ARTICLE_METER_MAX_SLUGS);
  const secondRoll = match[2] === "f" ? "free" : match[2] === "l" ? "lock" : undefined;
  return { v: 1, opened, secondRoll };
}

export function serializeArticleMeter(state: ArticleMeterState): string {
  const opened = state.opened
    .map((item) => normalizeMeterSlug(item))
    .filter((item): item is string => Boolean(item))
    .slice(-ARTICLE_METER_MAX_SLUGS);
  const slugs = opened.join(",");
  if (state.secondRoll === "free") return `1:${slugs}:f`;
  if (state.secondRoll === "lock") return `1:${slugs}:l`;
  return `1:${slugs}`;
}

/**
 * 1st unique article: free. 2nd: 50/50, sticky. 3rd+: always locked.
 * Reopening a previously free slug stays free.
 */
export function decideArticleMeter(
  state: ArticleMeterState,
  slug: string,
  rng: () => number = Math.random
): ArticleMeterDecision {
  const normalized = normalizeMeterSlug(slug);
  if (!normalized) {
    return { state, unlocked: false, index: -1 };
  }

  const existingIdx = state.opened.indexOf(normalized);
  const index = existingIdx >= 0 ? existingIdx : state.opened.length;
  const opened =
    existingIdx >= 0
      ? state.opened
      : [...state.opened, normalized].slice(-ARTICLE_METER_MAX_SLUGS);

  let secondRoll = state.secondRoll;
  let unlocked = false;
  if (index === 0) {
    unlocked = true;
  } else if (index === 1) {
    if (!secondRoll) {
      secondRoll = rng() < 0.5 ? "free" : "lock";
    }
    unlocked = secondRoll === "free";
  }

  return {
    state: { v: 1, opened, secondRoll },
    unlocked,
    index,
  };
}

export function articleSlugFromPathname(pathname: string): string | null {
  const { pathname: stripped } = resolveLocalePath(pathname);
  if (SKIP_PREFIXES.some((prefix) => stripped === prefix.slice(0, -1) || stripped.startsWith(prefix))) {
    return null;
  }
  const article = stripped.match(/^\/article\/([^/]+)\/?$/);
  if (article?.[1]) return normalizeMeterSlug(decodeURIComponent(article[1]));
  const publicDesk = stripped.match(/^\/verejnost\/clanky\/([^/]+)\/?$/);
  if (publicDesk?.[1]) return normalizeMeterSlug(decodeURIComponent(publicDesk[1]));
  return null;
}

export function overlayCookieHeader(
  raw: string | null | undefined,
  name: string,
  value: string
): string {
  const next = `${name}=${value}`;
  if (!raw) return next;
  const parts = raw
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith(`${name}=`));
  parts.push(next);
  return parts.join("; ");
}

export function resolveMagazineMeterUnlock(input: {
  cookie?: string | null;
  header?: string | null;
  slug: string;
  isBot?: boolean;
}): boolean {
  if (input.isBot) return false;
  if (input.header === "open") return true;
  if (input.header === "lock") return false;
  return decideArticleMeter(parseArticleMeter(input.cookie), input.slug).unlocked;
}
