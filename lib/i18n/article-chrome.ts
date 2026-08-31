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
    recsKicker: "Doporučené · Affiliate",
    recsTitle: "Top produkty pro dlouhověkost",
    moreInfo: "Více informací →",
    sponsored: "Affiliate · Sponzorováno",
  },
  de: {
    save: "Speichern",
    saved: "Gespeichert",
    share: "Teilen",
    related: "Verwandte Artikel",
    recommended: "Empfohlener Inhalt",
    articlesLabel: "Artikel",
    recsKicker: "Empfohlen · Affiliate",
    recsTitle: "Top-Produkte für Langlebigkeit",
    moreInfo: "Mehr erfahren →",
    sponsored: "Affiliate · Gesponsert",
  },
  fr: {
    save: "Enregistrer",
    saved: "Enregistré",
    share: "Partager",
    related: "À lire aussi",
    recommended: "Contenu recommandé",
    articlesLabel: "Articles",
    recsKicker: "Recommandé · Affiliation",
    recsTitle: "Produits phares pour la longévité",
    moreInfo: "En savoir plus →",
    sponsored: "Affiliation · Sponsorisé",
  },
  en: {
    save: "Save",
    saved: "Saved",
    share: "Share",
    related: "Related reading",
    recommended: "Recommended content",
    articlesLabel: "Articles",
    recsKicker: "Recommended · Affiliate",
    recsTitle: "Top longevity products",
    moreInfo: "Learn more →",
    sponsored: "Affiliate · Sponsored",
  },
};

export function getArticleChrome(locale?: string | null): ArticleChrome {
  return COPY[articleChromeLocale(locale)];
}
