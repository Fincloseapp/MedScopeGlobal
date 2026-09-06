/**
 * Homepage + magazine desks: Novinky, Veřejnost, Dlouhověkost, Články.
 * Classification is exclusive (longevity → news → public → magazine).
 */
import {
  countArticleWords,
  shouldHideFromPublicListing,
} from "@/lib/editorial/article-quality-audit";
import {
  articlePageKey,
  mixFreshFeed,
  selectResurfaceCandidates,
  withCategoryListingDate,
} from "@/lib/editorial/freshness";
import { resolveWriterAgent } from "@/lib/editorial/writer-agents";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { isListableInLocale } from "@/lib/i18n/filter-articles-for-locale";
import { filterActiveArticles } from "@/lib/v20/content-rules";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";

export type NewsDeskId = "novinky" | "verejnost" | "dlouhovekost" | "clanky";

export type NewsDeskDef = {
  id: NewsDeskId;
  label: string;
  href: string;
  more: string;
  kicker: string;
  blurb: string;
};

export const NEWS_DESKS: NewsDeskDef[] = [
  {
    id: "novinky",
    label: "Aktuality",
    href: "/aktualni-zpravy",
    more: "Všechny aktuality",
    kicker: "Aktuálně",
    blurb: "Zdravotnické události a novinky o dlouhověkosti — s kontextem pro Česko, bez senzace.",
  },
  {
    id: "verejnost",
    label: "Veřejnost",
    href: "/verejnost/clanky",
    more: "Články pro veřejnost",
    kicker: "Veřejné zdraví",
    blurb: "Prevence, nemoci a životní styl srozumitelně a právně korektně.",
  },
  {
    id: "dlouhovekost",
    label: "Dlouhověkost",
    href: "/verejnost/clanky?topic=dlouhovekost",
    more: "Články k tématu",
    kicker: "Healthspan",
    blurb: "Spánek, pohyb, výživa a biomarkery — co je důkaz a co je hype.",
  },
  {
    id: "clanky",
    label: "Články",
    href: "/articles",
    more: "Otevřít magazín",
    kicker: "Magazín",
    blurb: "Aktuální redakční čtení s fotografiemi a nezávislou kontrolou.",
  },
];

const LONGEVITY_CORE_RE =
  /dlouhověk|dlouhovek|longevity|healthspan|st[aá]rnut|biologick[yý]\s*v[eě]k|sarkopen|osteopor[oó]z|vo2\s*max|kostn[ií]\s*denzit|aktivn[ií]\s*st[aá]ř|zdrav[eé]\s*st[aá]rnut|zdrav[yý]ch\s*let|[žz][ií]t\s*d[eé]le|biomarker/i;

const LONGEVITY_RELATED_RE =
  /senior|senio[rř]i|ve\s*st[aá]ř[ií]|po\s*infarkt|10\s*minut\s*denn|z[uů]stat\s*fit|z[uů]stat\s*aktivn|aktivn[ií]m?\s*životu\s*po|prevence\s*osteoporoz/i;

const NEWS_RE =
  /novink|zpráv|zprav|ema\b|súkl|sukl|\bwho\b|mzčr|mzcr|cdc\b|outbreak|epidem|guideline|agentur/i;

function metaRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

function longevityHaystack(article: {
  title?: string | null;
  excerpt?: string | null;
  slug?: string | null;
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
}): string {
  const meta = metaRecord(article.metadata);
  const keywords = Array.isArray(meta.keywords)
    ? meta.keywords.join(" ")
    : String(meta.keywords ?? "");
  return [article.title, article.excerpt, article.slug, article.public_topic, keywords]
    .map((value) => String(value ?? ""))
    .join(" ");
}

export function isLongevityArticle(article: {
  title?: string | null;
  excerpt?: string | null;
  slug?: string | null;
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  const agent = resolveWriterAgent(article);
  if (agent?.id === "writer5") return true;
  const meta = metaRecord(article.metadata);
  const pillar = String(meta.content_pillar ?? meta.internal_topic ?? "")
    .toLowerCase()
    .trim();
  if (pillar === "dlouhovekost") return true;
  if (String(article.public_topic ?? "").toLowerCase() === "dlouhovekost") return true;
  const haystack = longevityHaystack(article);
  return LONGEVITY_CORE_RE.test(haystack) || LONGEVITY_RELATED_RE.test(haystack);
}

export function isNovinkyArticle(article: {
  title?: string | null;
  excerpt?: string | null;
  slug?: string | null;
  rubric_slug?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  const slug = String(article.slug ?? "").toLowerCase();
  if (slug.startsWith("zpravy-")) return true;
  const rubric = String(article.rubric_slug ?? "").toLowerCase();
  if (
    /novink|aktualni|aktuální|zprav|news|foreign/.test(rubric) ||
    rubric === "aktualni-zpravy"
  ) {
    return true;
  }
  const meta = metaRecord(article.metadata);
  const section = String(meta.section ?? "").toLowerCase();
  if (/news|zprav|aktual/.test(section)) return true;
  return NEWS_RE.test(`${article.title ?? ""} ${article.excerpt ?? ""}`);
}

export function isVerejnostArticle(article: {
  audience?: string | null;
  public_topic?: string | null;
  rubric_slug?: string | null;
  min_access_level?: string | null;
}): boolean {
  if (article.audience === "public") return true;
  if (article.public_topic) return true;
  if (article.rubric_slug === "verejnost") return true;
  return (article.min_access_level ?? "public") === "public";
}

export function classifyNewsDesk(article: DisplayArticle): NewsDeskId {
  const longevity = isLongevityArticle(article);
  const news = isNovinkyArticle(article);
  if (longevity && news) return "novinky";
  if (longevity) return "dlouhovekost";
  if (news) return "novinky";
  if (isVerejnostArticle(article)) return "verejnost";
  return "clanky";
}

export function isListableNewsArticle(
  article: DisplayArticle,
  now = new Date(),
  locale = "cs"
): boolean {
  if (!article.slug || !article.title?.trim()) return false;
  if (shouldHideFromPublicListing(article, now)) return false;
  if (filterActiveArticles([article]).length !== 1) return false;
  return isListableInLocale(article, locale);
}

/** Homepage desks: magazine longform plus shorter professional news briefs. */
export function isHomepageDeskArticle(
  article: DisplayArticle,
  now = new Date(),
  locale = "cs"
): boolean {
  if (isListableNewsArticle(article, now, locale)) return true;
  if (!article.slug || !article.title?.trim() || article.vip_only) return false;
  if (!isNovinkyArticle(article) || !isProfessionalAktualityTitle(article.title)) return false;
  const words = countArticleWords(article.content);
  const zpravy = String(article.slug ?? "").toLowerCase().startsWith("zpravy-");
  const newsFloor = zpravy ? 40 : 80;
  if (words > 0 && words < newsFloor) return false;
  if (zpravy) {
    return filterActiveArticles([article as never]).length === 1;
  }
  return isListableInLocale(article, locale);
}

function takeUnused(
  pool: DisplayArticle[],
  used: Set<string>,
  limit: number,
  pred?: (article: DisplayArticle) => boolean
): DisplayArticle[] {
  const out: DisplayArticle[] = [];
  for (const article of pool) {
    if (out.length >= limit) break;
    const key = articlePageKey(article);
    if (!key || used.has(key)) continue;
    if (pred && !pred(article)) continue;
    used.add(key);
    out.push(article);
  }
  return out;
}

export function splitNewsDesks(
  articles: DisplayArticle[],
  limits: Partial<Record<NewsDeskId, number>> = {},
  locale = "cs"
): Record<NewsDeskId, DisplayArticle[]> {
  const cap: Record<NewsDeskId, number> = {
    novinky: limits.novinky ?? 4,
    verejnost: limits.verejnost ?? 4,
    dlouhovekost: limits.dlouhovekost ?? 4,
    clanky: limits.clanky ?? 6,
  };
  const desks: Record<NewsDeskId, DisplayArticle[]> = {
    novinky: [],
    verejnost: [],
    dlouhovekost: [],
    clanky: [],
  };
  const used = new Set<string>();
  const wire = articles.filter((article) => String(article.slug ?? "").toLowerCase().startsWith("zpravy-"));
  const listable = articles.filter(
    (article) =>
      !String(article.slug ?? "").toLowerCase().startsWith("zpravy-") &&
      isHomepageDeskArticle(article, new Date(), locale)
  );
  const isNewsPriority = (article: DisplayArticle) => isNovinkyArticle(article);

  desks.novinky.push(
    ...takeUnused(
      wire.filter((article) => isProfessionalAktualityTitle(article.title)),
      used,
      cap.novinky
    )
  );
  desks.novinky.push(...takeUnused(listable, used, cap.novinky - desks.novinky.length, isNewsPriority));

  for (const article of listable) {
    const desk = classifyNewsDesk(article);
    if (desk === "novinky") continue;
    if (desks[desk].length >= cap[desk]) continue;
    const key = articlePageKey(article);
    if (!key || used.has(key)) continue;
    used.add(key);
    desks[desk].push(article);
  }

  const olderFirst = selectResurfaceCandidates(listable, listable.length);

  desks.dlouhovekost.push(
    ...takeUnused(
      olderFirst,
      used,
      cap.dlouhovekost - desks.dlouhovekost.length,
      isLongevityArticle
    )
  );
  desks.verejnost.push(
    ...takeUnused(
      olderFirst,
      used,
      cap.verejnost - desks.verejnost.length,
      (article) => isVerejnostArticle(article) && !isNovinkyArticle(article)
    )
  );
  desks.clanky.push(
    ...takeUnused(olderFirst, used, cap.clanky - desks.clanky.length)
  );
  if (desks.novinky.length < cap.novinky) {
    desks.novinky.push(
      ...takeUnused(listable, used, cap.novinky - desks.novinky.length, isNewsPriority)
    );
  }

  return {
    novinky: desks.novinky,
    verejnost: desks.verejnost.map((article) => withCategoryListingDate(article, "verejnost")),
    dlouhovekost: desks.dlouhovekost.map((article) =>
      withCategoryListingDate(article, "dlouhovekost")
    ),
    clanky: desks.clanky.map((article) => withCategoryListingDate(article, "clanky")),
  };
}

/** Homepage boxes + longevity strip — one article, one slot, same moment. */
export function uniqueHomepageLayout(
  articles: DisplayArticle[],
  locale = "cs"
): {
  desks: Record<NewsDeskId, DisplayArticle[]>;
  longevityReading: DisplayArticle[];
  usedKeys: string[];
} {
  const desks = splitNewsDesks(articles, {}, locale);
  const used = new Set(
    [...desks.novinky, ...desks.verejnost, ...desks.dlouhovekost, ...desks.clanky]
      .map((article) => articlePageKey(article))
      .filter(Boolean)
  );
  const longevityReading = takeUnused(
    articles.filter((article) => isHomepageDeskArticle(article, new Date(), locale)),
    used,
    3,
    isLongevityArticle
  ).map((article) => withCategoryListingDate(article, "dlouhovekost"));
  return { desks, longevityReading, usedKeys: [...used] };
}

export function mixListableFeed(
  articles: DisplayArticle[],
  limit: number,
  locale = "cs"
): DisplayArticle[] {
  const listable = articles.filter((article) => isHomepageDeskArticle(article, new Date(), locale));
  const resurface = selectResurfaceCandidates(listable, Math.max(4, Math.ceil(limit / 3)));
  return mixFreshFeed(listable, resurface, limit).map((article) => {
    const desk = classifyNewsDesk(article);
    return desk === "novinky" ? article : withCategoryListingDate(article, desk);
  });
}

/** Keep longevity cards in the homepage pool even when newer news crowds them out. */
export function pinLongevityIntoFeed(
  articles: DisplayArticle[],
  limit: number,
  locale = "cs"
): DisplayArticle[] {
  return pinHomepageDesks(articles, limit, locale);
}

/** Prefer section news, then the recency pool — one slug once. */
export function prependUniqueArticles(
  preferred: DisplayArticle[],
  rest: DisplayArticle[]
): DisplayArticle[] {
  const used = new Set<string>();
  const out: DisplayArticle[] = [];
  for (const article of [...preferred, ...rest]) {
    const key = articlePageKey(article);
    if (!key || used.has(key)) continue;
    used.add(key);
    out.push(article);
  }
  return out;
}

/** Reserve news + longevity so Aktuality is never starved by lifestyle cards. */
export function pinHomepageDesks(
  articles: DisplayArticle[],
  limit: number,
  locale = "cs"
): DisplayArticle[] {
  const listable = articles.filter((article) => isHomepageDeskArticle(article, new Date(), locale));
  const used = new Set<string>();
  const news = takeUnused(listable, used, Math.min(8, limit), isNovinkyArticle);
  const longevity = takeUnused(listable, used, Math.min(8, limit), isLongevityArticle);
  const rest = takeUnused(listable, used, Math.max(0, limit - news.length - longevity.length));
  return [...news, ...longevity, ...rest].slice(0, limit);
}

const GENERIC_NEWS_TITLE_RE =
  /^(zdravotní zpráva|epidemiologická zpráva|odborný přehled|klinická studie|komentář)\b/i;

export function isProfessionalAktualityTitle(title?: string | null): boolean {
  const clean = String(title ?? "").replace(/<[^>]+>/g, " ").trim();
  if (clean.length < 18) return false;
  if (GENERIC_NEWS_TITLE_RE.test(clean)) return false;
  if (/zahraniční zdravotnická zpráva/i.test(clean)) return false;
  return true;
}

/** Mix section news with longevity so Aktuality always reads current and healthspan-first. */
export function mergeAktualityListing<T extends { id: string; title?: string | null; published_at?: string | null }>(
  sectionArticles: T[],
  longevityArticles: T[],
  limit = 48
): T[] {
  const professionalSection = sectionArticles.filter((article) =>
    isProfessionalAktualityTitle(article.title)
  );
  const professionalLongevity = longevityArticles.filter((article) =>
    isProfessionalAktualityTitle(article.title)
  );
  const pinned = professionalLongevity.slice(0, 6);
  const byId = new Map<string, T>();
  for (const article of pinned) byId.set(article.id, article);
  for (const article of professionalSection) {
    if (!byId.has(article.id)) byId.set(article.id, article);
  }
  for (const article of professionalLongevity) {
    if (!byId.has(article.id)) byId.set(article.id, article);
  }
  const pinnedIds = new Set(pinned.map((article) => article.id));
  const rest = [...byId.values()]
    .filter((article) => !pinnedIds.has(article.id))
    .sort((a, b) => {
      const aTime = a.published_at ? Date.parse(a.published_at) : 0;
      const bTime = b.published_at ? Date.parse(b.published_at) : 0;
      return bTime - aTime;
    });
  return [...pinned, ...rest].slice(0, limit);
}

export function filterArticlesForDesk(
  articles: DisplayArticle[],
  desk: NewsDeskId | null,
  locale = "cs"
): DisplayArticle[] {
  const listable = articles.filter((article) => isListableNewsArticle(article, new Date(), locale));
  if (!desk || desk === "clanky") return listable;
  return listable.filter((article) => classifyNewsDesk(article) === desk);
}

type DeskCopy = Pick<NewsDeskDef, "label" | "more" | "kicker" | "blurb">;

const DESK_COPY: Record<string, Record<NewsDeskId, DeskCopy>> = {
  en: {
    novinky: {
      label: "News",
      more: "All updates",
      kicker: "Now",
      blurb: "Health news and longevity briefings — with context, no sensationalism.",
    },
    verejnost: {
      label: "Public health",
      more: "Articles for everyone",
      kicker: "Public health",
      blurb: "Prevention, illness, and lifestyle in plain language.",
    },
    dlouhovekost: {
      label: "Longevity",
      more: "On this topic",
      kicker: "Healthspan",
      blurb: "Sleep, movement, nutrition, biomarkers — evidence vs hype.",
    },
    clanky: {
      label: "Magazine",
      more: "Open magazine",
      kicker: "Magazine",
      blurb: "Editorial reading with photography and independent review.",
    },
  },
  de: {
    novinky: {
      label: "Nachrichten",
      more: "Alle Aktualitäten",
      kicker: "Aktuell",
      blurb: "Gesundheitsmeldungen und Langlebigkeit — mit Kontext, ohne Sensationslust.",
    },
    verejnost: {
      label: "Öffentlichkeit",
      more: "Artikel für alle",
      kicker: "Public Health",
      blurb: "Prävention, Krankheiten und Lebensstil verständlich erklärt.",
    },
    dlouhovekost: {
      label: "Langlebigkeit",
      more: "Zum Thema",
      kicker: "Healthspan",
      blurb: "Schlaf, Bewegung, Ernährung, Biomarker — Evidenz statt Hype.",
    },
    clanky: {
      label: "Magazin",
      more: "Magazin öffnen",
      kicker: "Magazin",
      blurb: "Redaktionelle Texte mit Fotos und unabhängiger Prüfung.",
    },
  },
  fr: {
    novinky: {
      label: "Actualités",
      more: "Toutes les actualités",
      kicker: "En ce moment",
      blurb: "L’actualité santé et la longévité — avec du contexte, sans sensationnalisme.",
    },
    verejnost: {
      label: "Grand public",
      more: "Articles pour tous",
      kicker: "Santé publique",
      blurb: "Prévention, maladies et mode de vie en langage clair.",
    },
    dlouhovekost: {
      label: "Longévité",
      more: "Sur le sujet",
      kicker: "Healthspan",
      blurb: "Sommeil, mouvement, nutrition, biomarqueurs — preuves vs hype.",
    },
    clanky: {
      label: "Magazine",
      more: "Ouvrir le magazine",
      kicker: "Magazine",
      blurb: "Lecture éditoriale avec photos et relecture indépendante.",
    },
  },
  es: {
    novinky: {
      label: "Noticias",
      more: "Todas las noticias",
      kicker: "Ahora",
      blurb: "Noticias de salud con contexto — sin sensacionalismo.",
    },
    verejnost: {
      label: "Público",
      more: "Artículos para todos",
      kicker: "Salud pública",
      blurb: "Prevención, enfermedades y estilo de vida en lenguaje claro.",
    },
    dlouhovekost: {
      label: "Longevidad",
      more: "Sobre el tema",
      kicker: "Healthspan",
      blurb: "Sueño, movimiento, nutrición, biomarcadores — evidencia vs hype.",
    },
    clanky: {
      label: "Revista",
      more: "Abrir revista",
      kicker: "Revista",
      blurb: "Lectura editorial con fotos y revisión independiente.",
    },
  },
  it: {
    novinky: {
      label: "Notizie",
      more: "Tutte le notizie",
      kicker: "Ora",
      blurb: "Notizie sanitarie con contesto — senza sensazionalismo.",
    },
    verejnost: {
      label: "Pubblico",
      more: "Articoli per tutti",
      kicker: "Sanità pubblica",
      blurb: "Prevenzione, malattie e stile di vita in linguaggio chiaro.",
    },
    dlouhovekost: {
      label: "Longevità",
      more: "Sul tema",
      kicker: "Healthspan",
      blurb: "Sonno, movimento, nutrizione, biomarcatori — evidenze vs hype.",
    },
    clanky: {
      label: "Magazine",
      more: "Apri il magazine",
      kicker: "Magazine",
      blurb: "Lettura editoriale con foto e revisione indipendente.",
    },
  },
  pl: {
    novinky: {
      label: "Aktualności",
      more: "Wszystkie newsy",
      kicker: "Teraz",
      blurb: "Wiadomości zdrowotne z kontekstem — bez sensacji.",
    },
    verejnost: {
      label: "Dla wszystkich",
      more: "Artykuły dla wszystkich",
      kicker: "Zdrowie publiczne",
      blurb: "Profilaktyka, choroby i styl życia prostym językiem.",
    },
    dlouhovekost: {
      label: "Długowieczność",
      more: "W temacie",
      kicker: "Healthspan",
      blurb: "Sen, ruch, żywienie, biomarkery — dowody vs hype.",
    },
    clanky: {
      label: "Magazyn",
      more: "Otwórz magazyn",
      kicker: "Magazyn",
      blurb: "Teksty redakcyjne ze zdjęciami i niezależną weryfikacją.",
    },
  },
  sk: {
    novinky: {
      label: "Novinky",
      more: "Všetky novinky",
      kicker: "Aktuálne",
      blurb: "Zdravotnícke udalosti s kontextom — bez senzácie.",
    },
    verejnost: {
      label: "Verejnosť",
      more: "Články pre verejnosť",
      kicker: "Verejné zdravie",
      blurb: "Prevencia, choroby a životný štýl zrozumiteľne.",
    },
    dlouhovekost: {
      label: "Dlhovekosť",
      more: "K téme",
      kicker: "Healthspan",
      blurb: "Spánok, pohyb, výživa a biomarkery — dôkaz vs hype.",
    },
    clanky: {
      label: "Články",
      more: "Otvoriť magazín",
      kicker: "Magazín",
      blurb: "Redakčné čítanie s fotografiami a nezávislou kontrolou.",
    },
  },
};

const DESK_COPY_EN_US: Record<NewsDeskId, DeskCopy> = {
  novinky: {
    label: "News",
    more: "All updates",
    kicker: "Now",
    blurb: "US and global health news — FDA, CDC, NIH — plus longevity briefings. No Czech-only paperwork.",
  },
  verejnost: {
    label: "Public health",
    more: "Articles for everyone",
    kicker: "Public health",
    blurb: "Prevention, weight, sleep and lifestyle for US readers — PCP and 911, not VZP.",
  },
  dlouhovekost: {
    label: "Longevity",
    more: "On this topic",
    kicker: "Healthspan",
    blurb: "Sleep, movement, slim-metabolic health, biohacking with evidence — written for the US edition.",
  },
  clanky: {
    label: "Magazine",
    more: "Open magazine",
    kicker: "Magazine",
    blurb: "Native US desk plus clearly labelled pieces from other MedScopeGlobal desks.",
  },
};

const DESK_COPY_EN_UK: Record<NewsDeskId, DeskCopy> = {
  novinky: {
    label: "News",
    more: "All updates",
    kicker: "Now",
    blurb: "UK and global health news — MHRA, NICE, NHS — with context, no sensationalism.",
  },
  verejnost: {
    label: "Public health",
    more: "Articles for everyone",
    kicker: "Public health",
    blurb: "Prevention and lifestyle for UK readers — GP and NHS 111, not Czech insurance.",
  },
  dlouhovekost: {
    label: "Longevity",
    more: "On this topic",
    kicker: "Healthspan",
    blurb: "Sleep, movement, sustainable weight, evidence-based biohacking — for the UK edition.",
  },
  clanky: {
    label: "Magazine",
    more: "Open magazine",
    kicker: "Magazine",
    blurb: "Native UK desk plus attributed shares from other MedScopeGlobal desks.",
  },
};

/** Desk chrome in the active UI language (Czech copy stays the source of truth). */
export function newsDesksForLocale(locale?: string | null): NewsDeskDef[] {
  const normalized = normalizeLocale(locale);
  const primary = primaryArticleLocale(normalized);
  if (primary === "cs") return NEWS_DESKS;
  const pack =
    normalized === "en-US"
      ? DESK_COPY_EN_US
      : normalized === "en-UK"
        ? DESK_COPY_EN_UK
        : (DESK_COPY[primary] ?? DESK_COPY.en);
  return NEWS_DESKS.map((desk) => ({ ...desk, ...pack[desk.id] }));
}
