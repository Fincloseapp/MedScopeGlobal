/**
 * Homepage + magazine desks: Novinky, Veřejnost, Dlouhověkost, Články.
 * Classification is exclusive (longevity → news → public → magazine).
 */
import { shouldHideFromPublicListing } from "@/lib/editorial/article-quality-audit";
import { mixFreshFeed, selectResurfaceCandidates } from "@/lib/editorial/freshness";
import { resolveWriterAgent } from "@/lib/editorial/writer-agents";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { filterActiveArticles, filterCzechContent } from "@/lib/v20/content-rules";
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
    label: "Novinky",
    href: "/novinky",
    more: "Všechny novinky",
    kicker: "Aktuálně",
    blurb: "Zdravotnické události s kontextem pro Česko — bez senzace.",
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
  rubric_slug?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
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
  if (isLongevityArticle(article)) return "dlouhovekost";
  if (isNovinkyArticle(article)) return "novinky";
  if (isVerejnostArticle(article)) return "verejnost";
  return "clanky";
}

export function isListableNewsArticle(article: DisplayArticle, now = new Date()): boolean {
  if (!article.slug || !article.title?.trim()) return false;
  if (shouldHideFromPublicListing(article, now)) return false;
  return filterCzechContent(filterActiveArticles([article]), "cs").length === 1;
}

export function splitNewsDesks(
  articles: DisplayArticle[],
  limits: Partial<Record<NewsDeskId, number>> = {}
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
  const listable = articles.filter((article) => isListableNewsArticle(article));
  for (const article of listable) {
    const desk = classifyNewsDesk(article);
    if (desks[desk].length < cap[desk]) desks[desk].push(article);
  }

  if (desks.clanky.length < cap.clanky) {
    const used = new Set(
      [...desks.novinky, ...desks.verejnost, ...desks.dlouhovekost, ...desks.clanky].map(
        (article) => article.id
      )
    );
    for (const article of listable) {
      if (desks.clanky.length >= cap.clanky) break;
      if (used.has(article.id)) continue;
      desks.clanky.push(article);
      used.add(article.id);
    }
  }

  return desks;
}

export function mixListableFeed(articles: DisplayArticle[], limit: number): DisplayArticle[] {
  const listable = articles.filter((article) => isListableNewsArticle(article));
  const resurface = selectResurfaceCandidates(listable, Math.max(4, Math.ceil(limit / 3)));
  return mixFreshFeed(listable, resurface, limit);
}

/** Keep longevity cards in the homepage pool even when newer news crowds them out. */
export function pinLongevityIntoFeed(articles: DisplayArticle[], limit: number): DisplayArticle[] {
  const listable = articles.filter((article) => isListableNewsArticle(article));
  const longevity = listable.filter((article) => isLongevityArticle(article));
  const mixed = mixListableFeed(listable, limit);
  if (longevity.length === 0) return mixed;
  const pinned = longevity.slice(0, 4);
  const pinnedIds = new Set(pinned.map((article) => article.id));
  const rest = mixed.filter((article) => !pinnedIds.has(article.id));
  return [...pinned, ...rest].slice(0, Math.max(limit, pinned.length));
}

export function filterArticlesForDesk(
  articles: DisplayArticle[],
  desk: NewsDeskId | null
): DisplayArticle[] {
  const listable = articles.filter((article) => isListableNewsArticle(article));
  if (!desk || desk === "clanky") return listable;
  return listable.filter((article) => classifyNewsDesk(article) === desk);
}

type DeskCopy = Pick<NewsDeskDef, "label" | "more" | "kicker" | "blurb">;

const DESK_COPY: Record<string, Record<NewsDeskId, DeskCopy>> = {
  en: {
    novinky: {
      label: "News",
      more: "All news",
      kicker: "Now",
      blurb: "Health news with context — no sensationalism.",
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
      label: "News",
      more: "Alle News",
      kicker: "Aktuell",
      blurb: "Gesundheitsmeldungen mit Kontext — ohne Sensationslust.",
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
      more: "Toutes les actus",
      kicker: "En ce moment",
      blurb: "L’actualité santé avec du contexte — sans sensationnalisme.",
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

/** Desk chrome in the active UI language (Czech copy stays the source of truth). */
export function newsDesksForLocale(locale?: string | null): NewsDeskDef[] {
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (primary === "cs") return NEWS_DESKS;
  const pack = DESK_COPY[primary] ?? DESK_COPY.en;
  return NEWS_DESKS.map((desk) => ({ ...desk, ...pack[desk.id] }));
}
