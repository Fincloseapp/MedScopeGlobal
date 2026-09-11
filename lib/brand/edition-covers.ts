import { MAGAZINE } from "@/lib/brand/magazine";
import { SITE } from "@/lib/config/site";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { normalizeLocale } from "@/lib/i18n/config";

/** Peaceful magazine editions only — no conflict-region travel covers. */
export type EditionCluster = "europe" | "east-asia" | "south-asia" | "africa" | "atlantic";

export type EditionCover = {
  id: string;
  src: string;
  cluster: EditionCluster;
  gender: "man" | "woman";
};

export const EDITION_COVERS: EditionCover[] = [
  { id: "europe-woman", src: "/assets/magazine/editions/europe-woman.jpg", cluster: "europe", gender: "woman" },
  { id: "europe-man", src: "/assets/magazine/editions/europe-man.jpg", cluster: "europe", gender: "man" },
  { id: "east-asia-woman", src: "/assets/magazine/editions/east-asia-woman.jpg", cluster: "east-asia", gender: "woman" },
  { id: "east-asia-man", src: "/assets/magazine/editions/east-asia-man.jpg", cluster: "east-asia", gender: "man" },
  { id: "india-woman", src: "/assets/magazine/editions/india-woman.jpg", cluster: "south-asia", gender: "woman" },
  { id: "india-man", src: "/assets/magazine/editions/india-man.jpg", cluster: "south-asia", gender: "man" },
  { id: "africa-woman", src: "/assets/magazine/editions/africa-woman.jpg", cluster: "africa", gender: "woman" },
  { id: "africa-man", src: "/assets/magazine/editions/africa-man.jpg", cluster: "africa", gender: "man" },
  { id: "portugal-woman", src: "/assets/magazine/editions/portugal-woman.jpg", cluster: "atlantic", gender: "woman" },
  { id: "portugal-man", src: "/assets/magazine/editions/portugal-man.jpg", cluster: "atlantic", gender: "man" },
];

const ALT: Record<ChromePack, string> = {
  cs: `Titulní stránka ${MAGAZINE.name}`,
  de: `Titelseite ${MAGAZINE.name}`,
  fr: `Page de titre ${MAGAZINE.name}`,
  en: `${MAGAZINE.name} title page`,
  it: `Pagina di titolo ${MAGAZINE.name}`,
  es: `Portada ${MAGAZINE.name}`,
  "pt-BR": `Capa ${MAGAZINE.name}`,
};

const ALT_EDITIONS: Record<string, string> = {
  sk: `Titulná strana ${MAGAZINE.name}`,
  pl: `Okładka ${MAGAZINE.name}`,
  ro: `Coperta ${MAGAZINE.name}`,
  hu: `${MAGAZINE.name} címlap`,
  ru: `Обложка ${MAGAZINE.name}`,
  uk: `Обкладинка ${MAGAZINE.name}`,
  be: `Вокладка ${MAGAZINE.name}`,
  zh: `${MAGAZINE.name}封面`,
  ja: `${MAGAZINE.name}の表紙`,
  ko: `${MAGAZINE.name} 표지`,
  vi: `Bìa ${MAGAZINE.name}`,
  id: `Sampul ${MAGAZINE.name}`,
  pt: `Capa ${MAGAZINE.name}`,
};

function hashSeed(input: string): number {
  let hash = 0;
  for (const char of input) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function clustersForLocale(locale?: string | null): EditionCluster[] {
  const key = String(locale ?? "en").toLowerCase();
  if (key === "ja" || key === "ko" || key === "zh-cn" || key === "vi" || key === "id") {
    return ["east-asia", "south-asia"];
  }
  if (key === "fr") return ["africa", "atlantic", "europe"];
  if (key === "pt" || key === "pt-br") return ["atlantic", "africa", "south-asia", "europe"];
  if (key === "en" || key === "en-us" || key === "en-uk") {
    return ["south-asia", "africa", "atlantic", "east-asia", "europe"];
  }
  if (key === "es") return ["atlantic", "africa", "europe"];
  return ["europe", "atlantic", "east-asia", "south-asia", "africa"];
}

export function pickEditionCover(locale?: string | null, seed = "week"): EditionCover {
  const preferred = new Set(clustersForLocale(locale));
  const pool = EDITION_COVERS.filter((row) => preferred.has(row.cluster));
  const list = pool.length > 0 ? pool : EDITION_COVERS;
  return list[hashSeed(`${locale ?? "en"}:${seed}`) % list.length]!;
}

export function editionCoverAlt(locale?: string | null): string {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  return ALT_EDITIONS[primary] ?? ALT[chromePack(locale)];
}

export function editionCoverAbsoluteUrl(cover: EditionCover, base = SITE.url): string {
  const origin = String(base).replace(/\/$/, "");
  return `${origin}${cover.src}`;
}

export function isoWeekSeed(at = new Date()): string {
  const utc = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
