import type { MediflowCopy } from "@/lib/i18n/mediflow-copy";

export type MediflowEdition = Partial<
  Omit<MediflowCopy, "diaryRows" | "mobileRows" | "pillars" | "downloadPageSteps">
> & {
  diaryRows?: MediflowCopy["diaryRows"];
  mobileRows?: MediflowCopy["mobileRows"];
  pillars?: MediflowCopy["pillars"];
  downloadPageSteps?: string[];
};

const EDITIONS: Record<string, MediflowEdition> = {
  sk: {
    metaTitle: "MediFlow — Váš osobný wellness denník | MedScopeGlobal",
    metaDescription: "Osobný wellness denník — články, symptómy a suplementy na jednom mieste. MediFlow nediagnostikuje.",
    today: "Dnes",
    journal: "MediFlow denník",
    lead: "Osobný wellness denník — články, symptómy a suplementy na jednom mieste.",
    startCta: "Spustiť MediFlow",
    vipCta: "VIP protokoly",
    previewTitle: "Náhľad denníka",
    pillarsTitle: "Tri veci, ktoré MediFlow drží pohromade",
    pillarsLead: "Jednoduchý denník napojený na ViaLongeVita — bez šumu dashboardu.",
    pillars: [
      { title: "Články z ViaLongeVita", description: "Texty o dlhovekosti a životnom štýle na jednom mieste." },
      { title: "Symptómy a suplementy", description: "Denný prehľad pre vás — nie na diagnózu." },
      { title: "Poznámky offline", description: "Poznámky ostávajú u vás; sync počká, kým budete online." },
    ],
    disclaimer: "MediFlow nie je na diagnózu. Obsah nie je lekárska rada.",
    tryCta: "Vyskúšať zadarmo",
    downloadPageKicker: "Nainštalovať MediFlow",
    downloadPageTitle: "Wellness denník v telefóne aj na PC",
    downloadPageLead:
      "MediFlow beží na medscopeglobal.com/app/mediflow — ukladáte články, sledujete symptómy a suplementy. Inštalácia na plochu je voliteľná.",
    downloadPageSteps: [
      "1. Na tomto zariadení klepnite na „Nainštalovať MediFlow na plochu“.",
      "2. Chrome/Edge: ikona ⊕ v adresnom riadku, alebo … → Aplikácie → Inštalovať.",
      "3. iPhone: Safari → Zdieľať → Pridať na plochu.",
    ],
    downloadPageBack: "← Späť na MediFlow",
  },
  pl: {
    metaTitle: "MediFlow — Twój osobisty dziennik wellness | MedScopeGlobal",
    metaDescription: "Osobisty dziennik wellness — artykuły, objawy i suplementy w jednym miejscu. MediFlow nie stawia diagnozy.",
    today: "Dziś",
    journal: "Dziennik MediFlow",
    lead: "Osobisty dziennik wellness — artykuły, objawy i suplementy w jednym miejscu.",
    startCta: "Otwórz MediFlow",
    vipCta: "Protokoły VIP",
    previewTitle: "Podgląd dziennika",
    pillarsTitle: "Trzy rzeczy, które MediFlow trzyma razem",
    pillarsLead: "Prosty dziennik powiązany z ViaLongeVita — bez szumu pulpitu.",
    pillars: [
      { title: "Artykuły z ViaLongeVita", description: "Teksty o długowieczności i stylu życia w jednym miejscu." },
      { title: "Objawy i suplementy", description: "Dzienny widok dla Ciebie — nie do diagnozy." },
      { title: "Notatki offline", description: "Notatki zostają u Ciebie; sync poczeka, aż będziesz online." },
    ],
    disclaimer: "MediFlow nie służy do diagnozy. Treść nie jest poradą lekarską.",
    tryCta: "Wypróbuj za darmo",
    downloadPageKicker: "Zainstaluj MediFlow",
    downloadPageTitle: "Dziennik wellness na telefonie i PC",
    downloadPageLead: "MediFlow działa na medscopeglobal.com/app/mediflow. Instalacja na ekran jest opcjonalna.",
    downloadPageSteps: [
      "1. Na tym urządzeniu stuknij „Zainstaluj MediFlow na ekranie”.",
      "2. Chrome/Edge: ⊕ na pasku adresu albo … → Aplikacje → Zainstaluj.",
      "3. iPhone: Safari → Udostępnij → Dodaj do ekranu początkowego.",
    ],
    downloadPageBack: "← Wróć do MediFlow",
  },
  ja: {
    metaTitle: "MediFlow — あなた専用のウェルネス日記 | MedScopeGlobal",
    metaDescription: "記事、症状、サプリを一箇所に。MediFlowは診断しません。",
    today: "今日",
    journal: "MediFlow日記",
    lead: "個人のウェルネス日記 — 記事、症状、サプリを一箇所に。",
    startCta: "MediFlowを開く",
    vipCta: "VIPプロトコル",
    previewTitle: "日記のプレビュー",
    pillarsTitle: "MediFlowがまとめる3つ",
    pillarsLead: "ViaLongeVitaにつながるシンプルな日記 — ダッシュボードの雑音なし。",
    pillars: [
      { title: "ViaLongeVitaの記事", description: "長寿と生活習慣の文章を一箇所に。" },
      { title: "症状とサプリ", description: "あなた向けの日次ビュー — 診断ではありません。" },
      { title: "オフラインのメモ", description: "メモは手元に残り、オンラインで同期します。" },
    ],
    disclaimer: "MediFlowは診断用ではありません。内容は医療助言ではありません。",
    tryCta: "無料で試す",
    downloadPageKicker: "MediFlowをインストール",
    downloadPageTitle: "スマホとPCのウェルネス日記",
    downloadPageLead: "MediFlowは medscopeglobal.com/app/mediflow で動きます。ホーム追加は任意です。",
    downloadPageSteps: [
      "1. この端末で「MediFlowをホーム画面に追加」をタップ。",
      "2. Chrome/Edge：アドレスバーの⊕、または … → アプリ → インストール。",
      "3. iPhone：Safari → 共有 → ホーム画面に追加。",
    ],
    downloadPageBack: "← MediFlowへ戻る",
  },
};

export function mediflowEdition(primary: string): MediflowEdition | undefined {
  return EDITIONS[primary];
}
