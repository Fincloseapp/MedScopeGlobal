import type { ArticleChrome } from "@/lib/i18n/article-chrome";

export type ArticleChromeEdition = Partial<ArticleChrome>;

const EDITIONS: Record<string, ArticleChromeEdition> = {
  sk: {
    save: "Uložiť",
    saved: "Uložené",
    share: "Zdieľať",
    related: "Súvisiace čítanie",
    recommended: "Odporúčaný obsah",
    articlesLabel: "Články",
    recsTitle: "Čo čitatelia berú ďalej",
    moreInfo: "Viac informácií →",
    sponsored: "Odporúčané",
    updated: "Aktualizované",
  },
  pl: {
    save: "Zapisz",
    saved: "Zapisano",
    share: "Udostępnij",
    related: "Powiązane lektury",
    recommended: "Polecane treści",
    articlesLabel: "Artykuły",
    recsTitle: "Co czytelnicy biorą dalej",
    moreInfo: "Więcej informacji →",
    sponsored: "Polecane",
    updated: "Zaktualizowano",
  },
  ja: {
    save: "保存",
    saved: "保存済み",
    share: "共有",
    related: "関連記事",
    recommended: "おすすめ",
    articlesLabel: "記事",
    recsTitle: "読者が次に開くもの",
    moreInfo: "詳しく →",
    sponsored: "おすすめ",
    updated: "更新",
  },
};

export function articleChromeEdition(primary: string): ArticleChromeEdition | undefined {
  return EDITIONS[primary];
}
