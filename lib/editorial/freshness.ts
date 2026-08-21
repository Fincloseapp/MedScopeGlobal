/**
 * Honest freshness: mix newly published articles with older quality pieces
 * whose topics match the current season/situation. Never forges created_at
 * or published_at — resurfacing uses updated_at + metadata.editorial_resurface.
 */
import {
  auditArticle,
  isOriginalMedScopeEditorial,
  shouldHideFromPublicListing,
  type AuditableArticle,
} from "@/lib/editorial/article-quality-audit";

export const FRESHNESS_BATCH_ID = "editorial-freshness-2026-08-19-v1";
export const NEW_PER_RESURFACE = 2;
export const MIN_RESURFACE_AGE_DAYS = 10;
export const MAX_RESURFACE_AGE_DAYS = 400;
export const RESURFACE_COOLDOWN_DAYS = 21;
export const DEFAULT_DAILY_RESURFACE_LIMIT = 8;

export type SituationTheme = {
  id: string;
  labelCs: string;
  keywords: string[];
};

export type EditorialResurface = {
  at: string;
  theme_id: string;
  theme_label: string;
  reason: "seasonal_topic_match";
  batch_id: string;
  original_published_at: string | null;
};

export type FreshnessArticle = AuditableArticle & {
  id: string;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  slug?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  source_url?: string | null;
  source_name?: string | null;
  audience?: string | null;
  min_access_level?: string | null;
  public_topic?: string | null;
  rubric_slug?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function currentSituationThemes(now = new Date()): SituationTheme[] {
  const month = now.getUTCMonth() + 1;
  const themes: SituationTheme[] = [
    {
      id: "cardio",
      labelCs: "Kardiovaskulární prevence",
      keywords: [
        "srdc",
        "kardi",
        "tlak",
        "hypertenz",
        "cholesterol",
        "lp(a)",
        "lp a",
        "ateroskler",
        "cévn",
        "cevn",
      ],
    },
    {
      id: "metabolic",
      labelCs: "Metabolismus a diabetes",
      keywords: ["diabet", "metabol", "obezit", "hmotnost", "inzulin", "glukóz", "glukoz"],
    },
    {
      id: "prevention",
      labelCs: "Prevence a screening",
      keywords: ["prevenc", "očkov", "ockov", "screening", "vakcin"],
    },
    {
      id: "mental",
      labelCs: "Duševní zdraví",
      keywords: ["dušev", "dusev", "úzkost", "uzkost", "depres", "spánek", "spanek", "stres"],
    },
  ];

  if (month >= 6 && month <= 8) {
    themes.push({
      id: "heat",
      labelCs: "Vedro a hydratace",
      keywords: ["vedr", "hork", "hydrat", "úpal", "upal", "slunce", "teplot"],
    });
    themes.push({
      id: "activity",
      labelCs: "Pohyb a vytrvalost",
      keywords: ["pohyb", "trénink", "trenink", "zóna 2", "zona 2", "vytrval", "cvičen", "cvicen"],
    });
  }

  if (month >= 8 && month <= 10) {
    themes.push({
      id: "study",
      labelCs: "Studium a přijímačky",
      keywords: ["přijím", "prijim", "student", "fakult", "biologie", "příprav", "priprav"],
    });
    themes.push({
      id: "respiratory",
      labelCs: "Dýchací cesty a alergie",
      keywords: ["respir", "chřip", "chrip", "astma", "alerg", "plic", "kašel", "kasel"],
    });
  }

  if (month >= 11 || month <= 3) {
    themes.push({
      id: "winter_infection",
      labelCs: "Sezónní infekce",
      keywords: ["chřip", "chrip", "covid", "rs virus", "respir", "imunit"],
    });
  }

  return themes;
}

export function articleSearchBlob(article: FreshnessArticle): string {
  return [
    article.title,
    article.excerpt,
    article.public_topic,
    article.rubric_slug,
    article.slug,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
}

export function matchSituationThemes(
  article: FreshnessArticle,
  now = new Date()
): SituationTheme[] {
  const blob = articleSearchBlob(article);
  return currentSituationThemes(now).filter((theme) =>
    theme.keywords.some((keyword) => blob.includes(keyword))
  );
}

export function readEditorialResurface(
  metadata: Record<string, unknown> | null | undefined
): EditorialResurface | null {
  const raw = metadata?.editorial_resurface;
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.at !== "string" || typeof row.theme_id !== "string") return null;
  return {
    at: row.at,
    theme_id: row.theme_id,
    theme_label: String(row.theme_label ?? row.theme_id),
    reason: "seasonal_topic_match",
    batch_id: String(row.batch_id ?? ""),
    original_published_at:
      typeof row.original_published_at === "string" ? row.original_published_at : null,
  };
}

export function isQuarantined(article: FreshnessArticle): boolean {
  const quarantine = article.metadata?.editorial_quarantine;
  return Boolean(quarantine && typeof quarantine === "object");
}

function ageDays(iso: string | null | undefined, now: Date): number | null {
  if (!iso) return null;
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return null;
  return (now.getTime() - ts) / 86_400_000;
}

export function isResurfaceAge(article: FreshnessArticle, now = new Date()): boolean {
  const publishedAge = ageDays(article.published_at ?? article.created_at, now);
  if (publishedAge == null) return false;
  if (publishedAge < MIN_RESURFACE_AGE_DAYS || publishedAge > MAX_RESURFACE_AGE_DAYS) {
    return false;
  }
  const last = readEditorialResurface(article.metadata);
  if (last) {
    const since = ageDays(last.at, now);
    if (since != null && since < RESURFACE_COOLDOWN_DAYS) return false;
  }
  return true;
}

export function passesResurfaceQuality(article: FreshnessArticle, now = new Date()): boolean {
  if (isQuarantined(article)) return false;
  if (shouldHideFromPublicListing(article, now)) return false;
  const hasSource = /^https?:\/\//i.test(String(article.source_url ?? ""));
  if (!hasSource && !isOriginalMedScopeEditorial(article)) return false;
  if (article.content) {
    const audit = auditArticle(article, now);
    if (audit.severe) return false;
    if (audit.issues.some((issue) => issue.code === "thin_content")) return false;
  }
  return true;
}

export function isResurfaceCandidate(article: FreshnessArticle, now = new Date()): boolean {
  return (
    passesResurfaceQuality(article, now) &&
    isResurfaceAge(article, now) &&
    matchSituationThemes(article, now).length > 0
  );
}

export function mixFreshFeed<T extends { id: string }>(
  recent: T[],
  resurface: T[],
  limit: number,
  newPerResurface = NEW_PER_RESURFACE
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  let recentIndex = 0;
  let resurfaceIndex = 0;

  const pushUnique = (item: T | undefined) => {
    if (!item || seen.has(item.id) || out.length >= limit) return false;
    seen.add(item.id);
    out.push(item);
    return true;
  };

  while (out.length < limit && (recentIndex < recent.length || resurfaceIndex < resurface.length)) {
    for (let n = 0; n < newPerResurface && out.length < limit; n += 1) {
      while (recentIndex < recent.length && !pushUnique(recent[recentIndex])) {
        recentIndex += 1;
      }
      recentIndex += 1;
    }
    while (resurfaceIndex < resurface.length && !pushUnique(resurface[resurfaceIndex])) {
      resurfaceIndex += 1;
    }
    resurfaceIndex += 1;
  }

  return out;
}

export function selectResurfaceCandidates<T extends FreshnessArticle>(
  articles: T[],
  limit: number,
  now = new Date()
): T[] {
  return articles
    .filter((article) => isResurfaceCandidate(article, now))
    .sort((a, b) => {
      const themeDelta = matchSituationThemes(b, now).length - matchSituationThemes(a, now).length;
      if (themeDelta !== 0) return themeDelta;
      const aUpdated = new Date(a.updated_at ?? a.published_at ?? 0).getTime();
      const bUpdated = new Date(b.updated_at ?? b.published_at ?? 0).getTime();
      return bUpdated - aUpdated;
    })
    .slice(0, limit);
}

export function buildResurfaceMetadata(
  article: FreshnessArticle,
  now = new Date()
): { metadata: Record<string, unknown>; theme: SituationTheme } | null {
  const theme = matchSituationThemes(article, now)[0];
  if (!theme) return null;
  const metadata: Record<string, unknown> = { ...(article.metadata ?? {}) };
  metadata.editorial_resurface = {
    at: now.toISOString(),
    theme_id: theme.id,
    theme_label: theme.labelCs,
    reason: "seasonal_topic_match",
    batch_id: FRESHNESS_BATCH_ID,
    original_published_at: article.published_at ?? article.created_at ?? null,
  } satisfies EditorialResurface;
  return { metadata, theme };
}

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

export function formatArticleDateLabel(
  article: Pick<FreshnessArticle, "published_at" | "created_at" | "updated_at" | "metadata">,
  locale = "cs-CZ"
): { text: string; dateTime: string; kind: "published" | "updated" } | null {
  const publishedIso = article.published_at ?? article.created_at;
  if (!publishedIso) return null;
  const resurface = readEditorialResurface(article.metadata);
  const updatedIso = resurface?.at ?? article.updated_at;
  const published = new Date(publishedIso);
  const updated = updatedIso ? new Date(updatedIso) : null;
  const showUpdated =
    Boolean(resurface) ||
    (updated != null &&
      !Number.isNaN(updated.getTime()) &&
      updated.getTime() - published.getTime() >= 2 * 86_400_000);

  if (showUpdated && updated && !Number.isNaN(updated.getTime())) {
    return {
      kind: "updated",
      dateTime: updated.toISOString(),
      text: `Aktualizováno ${updated.toLocaleDateString(locale, DATE_OPTS)}`,
    };
  }

  return {
    kind: "published",
    dateTime: publishedIso,
    text: published.toLocaleDateString(locale, DATE_OPTS),
  };
}
