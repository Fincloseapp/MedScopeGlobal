import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

type Pack = "cs" | "de" | "fr" | "en";

export function articleChromeLocale(locale?: string | null): Pack {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "cs") return "cs";
  if (primary === "de") return "de";
  if (primary === "fr") return "fr";
  return "en";
}

type ArticleChrome = {
  save: string;
  saved: string;
  share: string;
  related: string;
  recommended: string;
  articlesLabel: string;
  recsKicker: string;
  recsTitle: string;
  moreInfo: string;
  sponsored: string;
};

const COPY: Record<Pack, ArticleChrome> = {
  cs: {
    save: "Uložit",
    saved: "Uloženo",
    share: "Sdílet",
    related: "Související čtení",
    recommended: "Doporučený obsah",
    articlesLabel: "Články",
    recsKicker: "ViaLongeVita",
    recsTitle: "Co čtenáři berou dál",
    moreInfo: "Více informací →",
    sponsored: "Doporučeno",
  },
  de: {
    save: "Speichern",
    saved: "Gespeichert",
    share: "Teilen",
    related: "Verwandte Artikel",
    recommended: "Empfohlener Inhalt",
    articlesLabel: "Artikel",
    recsKicker: "ViaLongeVita",
    recsTitle: "Wonach Leser als Nächstes greifen",
    moreInfo: "Mehr erfahren →",
    sponsored: "Empfohlen",
  },
  fr: {
    save: "Enregistrer",
    saved: "Enregistré",
    share: "Partager",
    related: "À lire aussi",
    recommended: "Contenu recommandé",
    articlesLabel: "Articles",
    recsKicker: "ViaLongeVita",
    recsTitle: "Ce que les lecteurs cherchent ensuite",
    moreInfo: "En savoir plus →",
    sponsored: "Recommandé",
  },
  en: {
    save: "Save",
    saved: "Saved",
    share: "Share",
    related: "Related reading",
    recommended: "Recommended content",
    articlesLabel: "Articles",
    recsKicker: "ViaLongeVita",
    recsTitle: "What readers reach for next",
    moreInfo: "Learn more →",
    sponsored: "Recommended",
  },
};

export function getArticleChrome(locale?: string | null): ArticleChrome {
  return COPY[articleChromeLocale(locale)];
}
