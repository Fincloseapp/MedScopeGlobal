import type { FirmyDeskCopy } from "@/lib/i18n/firmy-desk-copy";

export type FirmyDeskEdition = Partial<Omit<FirmyDeskCopy, "rooms">> & {
  rooms?: Partial<Record<keyof FirmyDeskCopy["rooms"], Partial<FirmyDeskCopy["rooms"][keyof FirmyDeskCopy["rooms"]]>>>;
};

const EDITIONS: Record<string, FirmyDeskEdition> = {
  sk: {
    metaTitle: "Pre firmy — inzercia na ViaLongeVita",
    metaDescription:
      "Bannery, sponzorované články a partnerstvá pre pharma, kliniky a univerzity. Banner od 5 000 Kč/mes.",
    eyebrow: "Firmy a partneri",
    title: "Inzercia na ViaLongeVita",
    lead: "Zdravotnícke firmy inzerujú v magazíne, nie v lekárskej zóne. Cenník je orientačný, ponuka do 2 pracovných dní.",
    roomsKicker: "Formáty",
    roomsTitle: "Kam patrí ktorý dopyt",
    rooms: {
      cenik: {
        title: "Cenník",
        body: "Banner 5 000 Kč/mes., sponzorovaný článok 15 000 Kč, enterprise na mieru.",
        metaTitle: "B2B cenník pre firmy",
        lead: "Orientačné ceny bez DPH. Finálnu ponuku pripravíme do 2 pracovných dní.",
      },
      reklama: {
        title: "Reklama",
        body: "Bannery a newsletter sloty v magazíne. Lekárska zóna ostáva bez reklám.",
        metaTitle: "Reklama pre zdravotnícke firmy",
        lead: "Bannery rotujú v magazíne a vo verejnej časti. OrdiZapis a /lekari reklamu neberú.",
      },
      partnerstvi: {
        title: "Partnerstvo",
        body: "Univerzitná a inštitucionálna spolupráca — nie affiliate a nie skrytá inzercia.",
        lead: "Partnerstvo je označené. Nie je to skrytá inzercia a nie je to vstup do lekárskej zóny.",
      },
      kampane: {
        title: "Kampane",
        body: "Segmentácia čitateľmi magazínu / verejnosť. Lekári a študenti majú vlastné plochy bez affiliate.",
        lead: "Kampane cielia magazín a verejnosť. Odborné plochy lekárov ostávajú bez affiliate.",
      },
      kosmetika: {
        title: "Kozmetické značky",
        body: "Prémiová dermokozmetika v rubrike Kozmetika — označené partnerstvo, nie lekárska zóna.",
        lead: "Bannery, sponzorovaný článok a cielenie na /verejnost/clanky?topic=kosmetika.",
      },
    },
  },
  pl: {
    metaTitle: "Dla firm — reklama na ViaLongeVita",
    metaDescription: "Bannery, artykuły partnerskie i współpraca dla pharmy, klinik i uczelni.",
    eyebrow: "Firmy i partnerzy",
    title: "Reklama na ViaLongeVita",
    lead: "Firmy zdrowotne reklamują się w magazynie, nie w strefie lekarskiej. Cennik jest orientacyjny; oferta w 2 dni robocze.",
    roomsKicker: "Formaty",
    roomsTitle: "Gdzie należy które zapytanie",
    rooms: {
      cenik: { title: "Cennik", body: "Banner 5 000 Kč/mies., artykuł partnerski 15 000 Kč, enterprise na zamówienie." },
      reklama: { title: "Reklama", body: "Bannery i sloty newslettera w magazynie. Strefa lekarska bez reklam." },
      partnerstvi: { title: "Partnerstwo", body: "Współpraca uniwersytecka i instytucjonalna — nie affiliate i nie ukryta reklama." },
      kampane: { title: "Kampanie", body: "Segmenty: katalog magazynu / czytelnicy. Lekarze i studenci bez affiliate." },
      kosmetika: { title: "Marki kosmetyczne", body: "Premium dermokosmetyki w Pielęgnacji — oznaczone partnerstwo." },
    },
  },
  ja: {
    metaTitle: "企業向け — ViaLongeVitaの広告",
    metaDescription: "製薬、クリニック、大学向けのバナー、提携記事、パートナーシップ。",
    eyebrow: "企業とパートナー",
    title: "ViaLongeVitaの広告",
    lead: "ヘルスケア企業は雑誌に出稿し、医師ゾーンには出ません。料金は目安。見積もりは2営業日以内。",
    roomsKicker: "フォーマット",
    roomsTitle: "どの問い合わせがどこか",
    rooms: {
      cenik: { title: "料金", body: "バナー月5 000 Kč、提携記事15 000 Kč、エンタープライズは個別。" },
      reklama: { title: "広告", body: "雑誌のバナーとニュースレター枠。医師ゾーンは広告なし。" },
      partnerstvi: { title: "提携", body: "大学・機関との協力 — アフィリエイトでも隠れた広告でもない。" },
      kampane: { title: "キャンペーン", body: "雑誌読者と一般向け。医師と学生の面はアフィリエイトなし。" },
      kosmetika: { title: "化粧品ブランド", body: "スキンケア欄のプレミアムダーモコスメ — 表示付き提携。" },
    },
  },
};

export function firmyDeskEdition(primary: string): FirmyDeskEdition | undefined {
  return EDITIONS[primary];
}
