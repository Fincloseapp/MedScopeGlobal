import type { PackCopy } from "@/lib/i18n/medipacient-copy";

export type MedipacientEdition = Partial<PackCopy>;

const EDITIONS: Record<string, MedipacientEdition> = {
  sk: {
    metaTitle: "MeDipacient — Lekárske správy prehľadne po ruke | MedScopeGlobal",
    metaDescription:
      "Odfotíte PDF alebo fotografiu lekárskej správy — aj bez dát. OCR vytiahne diagnózy, lieky a kontroly. Nie je náhrada starostlivosti.",
    kicker: "Aplikácia pre verejnosť · medscopeglobal.com",
    title: "Lekárske správy prehľadne po ruke",
    pitch:
      "Odfotíte PDF alebo fotografiu lekárskej správy — aj bez dát. Po pripojení OCR vytiahne diagnózy, lieky a kontroly.",
    downloadCta: "Stiahnuť MeDipacient",
    downloadGuideCta: "Sprievodca stiahnutím",
    steps: [
      { n: "1 / 6", title: "Po vyšetrení nahráte správu.", cta: "Nahrať správu" },
      { n: "2 / 6", title: "AI správu prečíta, vyhodnotí a uloží." },
      { n: "3 / 6", title: "Už nikdy nezabudnete." },
      { n: "4 / 6", title: "Všetky správy na jednom mieste.", cta: "Nahrať správu" },
      { n: "5 / 6", title: "Jednoduché pre každého. Od študentov po seniorov." },
      { n: "6 / 6", title: "Premium dohliada na zdravie. Vy žijete." },
    ],
    demoEyebrow: "Skúšobný dashboard",
    demoTitle: "Už teraz vidíte, čo aplikácia vie",
    demoLead: "Dashboard ukáže, ako správy sedia na jednej osi. Vaše nahrávky sa pridajú do rovnakého pohľadu.",
    demoOpen: "Otvoriť plný dashboard",
    freeTitle: "Zadarmo",
    freeItems: ["Nahrávanie správ", "Základná analýza a časová os", "Ukážka v dashboarde"],
    premiumTitle: "Premium od {price}",
    premiumItems: ["Pokročilá analýza a liekový plán", "Pripomienky kontrol", "Verejný magazín bez reklám"],
    subscribeCta: "Predplatné {price}",
    disclaimer: "Vzdelávací prehľad správ — nie náhrada lekárskej starostlivosti.",
    downloadPageKicker: "Nainštalovať na plochu",
    downloadPageTitle: "V telefóne aj na počítači",
    downloadPageLead:
      "Aplikácia beží na medscopeglobal.com/app/pacient — Chrome/Edge na PC a Safari/Chrome v mobile, s rovnakým účtom. Inštalácia na plochu je voliteľná.",
    downloadPageBack: "← Ako MeDipacient funguje",
  },
  pl: {
    metaTitle: "MeDipacient — Wyniki badań jasno pod ręką | MedScopeGlobal",
    kicker: "Aplikacja dla czytelników · medscopeglobal.com",
    title: "Wyniki badań jasno pod ręką",
    pitch: "Zrób zdjęcie PDF lub wyniku — nawet offline. Po połączeniu OCR wyciągnie rozpoznania, leki i kontrole.",
    downloadCta: "Pobierz MeDipacient",
    downloadGuideCta: "Przewodnik instalacji",
    steps: [
      { n: "1 / 6", title: "Po wizycie wgrywasz wynik.", cta: "Wgraj wynik" },
      { n: "2 / 6", title: "AI czyta, ocenia i zapisuje." },
      { n: "3 / 6", title: "Nic nie umyka." },
      { n: "4 / 6", title: "Wszystkie wyniki w jednym miejscu.", cta: "Wgraj wynik" },
      { n: "5 / 6", title: "Proste dla każdego." },
      { n: "6 / 6", title: "Premium pilnuje wątku. Ty żyjesz." },
    ],
    demoTitle: "Zobacz, co aplikacja robi",
    freeTitle: "Za darmo",
    premiumTitle: "Premium od {price}",
    subscribeCta: "Prenumerata {price}",
    disclaimer: "Przegląd edukacyjny wyników — nie zastępuje opieki lekarskiej.",
    downloadPageKicker: "Zainstaluj na ekranie",
    downloadPageTitle: "Na telefonie i komputerze",
    downloadPageBack: "← Jak działa MeDipacient",
  },
  ja: {
    metaTitle: "MeDipacient — 検査結果をわかりやすく手元に | MedScopeGlobal",
    kicker: "一般向けアプリ · medscopeglobal.com",
    title: "検査結果をわかりやすく手元に",
    pitch: "PDFや検査結果を撮影 — オフラインでも可。再接続後、OCRが診断・薬・フォローを取り出します。",
    downloadCta: "MeDipacientをダウンロード",
    downloadGuideCta: "インストール案内",
    steps: [
      { n: "1 / 6", title: "受診後に結果をアップロード。", cta: "結果を上げる" },
      { n: "2 / 6", title: "AIが読み、整理し、保存します。" },
      { n: "3 / 6", title: "見逃しません。" },
      { n: "4 / 6", title: "すべての結果を一箇所に。", cta: "結果を上げる" },
      { n: "5 / 6", title: "だれでも簡単に。" },
      { n: "6 / 6", title: "Premiumが流れを守る。あなたは生きる。" },
    ],
    demoTitle: "アプリの動きを見る",
    freeTitle: "無料",
    premiumTitle: "Premium {price}から",
    subscribeCta: "購読 {price}",
    disclaimer: "結果の教育的な概要 — 医療の代わりではありません。",
    downloadPageKicker: "ホーム画面に追加",
    downloadPageTitle: "スマホとパソコンで",
    downloadPageBack: "← MeDipacientの使い方",
  },
};

export function medipacientEdition(primary: string): MedipacientEdition | undefined {
  return EDITIONS[primary];
}
