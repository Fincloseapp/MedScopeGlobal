import type { LekyHubCopy } from "@/lib/i18n/leky-hub-copy";

export type LekyHubEdition = Partial<Omit<LekyHubCopy, "links">> & {
  links?: LekyHubCopy["links"];
};

const EDITIONS: Record<string, LekyHubEdition> = {
  sk: {
    metaTitle: "Lieky a farmakoterapia | MedScopeGlobal",
    metaDescription: "Liekové novinky z SÚKL, EMA a FDA — schválenia, bezpečnostné upozornenia a pipeline.",
    kicker: "medscopeglobal.com · Lieky",
    title: "Lieky a farmakoterapia",
    lead: "Schválenia, bezpečnostné upozornenia a pipeline z oficiálnych registrov SÚKL, EMA a FDA.",
    lastSync: "Posledná synchronizácia:",
    allNews: "Všetky novinky",
    approved: "Schválené prípravky",
    latestTitle: "Najnovšie liekové novinky",
    seeAll: "Zobraziť všetko →",
    empty: "Prvá synchronizácia z oficiálnych zdrojov prebehne automaticky počas dňa.",
    emptyHint: "SÚKL, EMA a FDA — monitoring cez denný CRON medscopeglobal.com.",
    links: [
      { href: "/leky/novinky", label: "Novinky o liekoch", desc: "Registrácia, SPC, bezpečnosť, úhrady" },
      { href: "/leky/schvalene", label: "Schválené lieky", desc: "Nová registrácia a indikácie" },
      { href: "/leky/pipeline", label: "Pipeline", desc: "Pripravované prípravky vo vývoji" },
      { href: "/ai/leky", label: "AI lieky", desc: "Odborný AI prehľad" },
    ],
  },
  pl: {
    metaTitle: "Leki | MedScopeGlobal",
    metaDescription: "Nowości lekowe z EMA, FDA i SÚKL — pozwolenia, bezpieczeństwo, pipeline.",
    kicker: "medscopeglobal.com · Leki",
    title: "Leki i farmakoterapia",
    lead: "Pozwolenia, alerty bezpieczeństwa i pipeline z oficjalnych rejestrów EMA, FDA i SÚKL.",
    lastSync: "Ostatnia synchronizacja:",
    allNews: "Wszystkie nowości",
    approved: "Zatwierdzone preparaty",
    latestTitle: "Najnowsze nowości lekowe",
    seeAll: "Zobacz wszystko →",
    empty: "Pierwsza synchronizacja ze źródeł oficjalnych uruchomi się automatycznie w ciągu dnia.",
    links: [
      { href: "/leky/novinky", label: "Nowości o lekach", desc: "Pozwolenie, ChPL, bezpieczeństwo" },
      { href: "/leky/schvalene", label: "Zatwierdzone leki", desc: "Nowe pozwolenia i wskazania" },
      { href: "/leky/pipeline", label: "Pipeline", desc: "Preparaty w rozwoju" },
      { href: "/ai/leky", label: "AI leki", desc: "Przegląd AI" },
    ],
  },
  ja: {
    metaTitle: "医薬品 | MedScopeGlobal",
    metaDescription: "EMA、FDA、SÚKLの医薬品ニュース — 承認、安全、パイプライン。",
    kicker: "medscopeglobal.com · 医薬品",
    title: "医薬品と薬物療法",
    lead: "EMA、FDA、SÚKLの公式登録からの承認、安全情報、パイプライン。",
    lastSync: "最終同期：",
    allNews: "すべてのニュース",
    approved: "承認済み製剤",
    latestTitle: "最新の医薬品ニュース",
    seeAll: "すべて見る →",
    empty: "公式ソースの初回同期は日中に自動で走ります。",
    links: [
      { href: "/leky/novinky", label: "医薬品ニュース", desc: "承認、添付文書、安全" },
      { href: "/leky/schvalene", label: "承認薬", desc: "新しい承認と適応" },
      { href: "/leky/pipeline", label: "パイプライン", desc: "開発中の製剤" },
      { href: "/ai/leky", label: "AI医薬品", desc: "専門のAI概要" },
    ],
  },
};

export function lekyHubEdition(primary: string): LekyHubEdition | undefined {
  return EDITIONS[primary];
}
