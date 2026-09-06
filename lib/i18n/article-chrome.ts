import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

type Pack = ChromePack;

export function articleChromeLocale(locale?: string | null): Pack {
  return chromePack(locale);
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
  updated: string;
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
    updated: "Aktualizováno",
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
    updated: "Aktualisiert",
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
    updated: "Mis à jour",
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
    updated: "Updated",
  },
  it: {
    save: "Salva",
    saved: "Salvato",
    share: "Condividi",
    related: "Letture correlate",
    recommended: "Contenuti consigliati",
    articlesLabel: "Articoli",
    recsKicker: "ViaLongeVita",
    recsTitle: "Cosa cercano i lettori dopo",
    moreInfo: "Scopri di più →",
    sponsored: "Consigliato",
    updated: "Aggiornato",
  },
  es: {
    save: "Guardar",
    saved: "Guardado",
    share: "Compartir",
    related: "Lecturas relacionadas",
    recommended: "Contenido recomendado",
    articlesLabel: "Artículos",
    recsKicker: "ViaLongeVita",
    recsTitle: "Qué buscan los lectores después",
    moreInfo: "Saber más →",
    sponsored: "Recomendado",
    updated: "Actualizado",
  },
  "pt-BR": {
    save: "Salvar",
    saved: "Salvo",
    share: "Compartilhar",
    related: "Leitura relacionada",
    recommended: "Conteúdo recomendado",
    articlesLabel: "Artigos",
    recsKicker: "ViaLongeVita",
    recsTitle: "O que os leitores buscam depois",
    moreInfo: "Saiba mais →",
    sponsored: "Recomendado",
    updated: "Atualizado",
  },
};

export function getArticleChrome(locale?: string | null): ArticleChrome {
  return COPY[articleChromeLocale(locale)];
}
