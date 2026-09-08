import type { ProMeCopy } from "@/lib/i18n/pro-me-copy";

export type ProMeEdition = Partial<Omit<ProMeCopy, "audiences">> & {
  audiences?: Partial<Record<keyof ProMeCopy["audiences"], Partial<ProMeCopy["audiences"][keyof ProMeCopy["audiences"]]>>>;
};

const EDITIONS: Record<string, ProMeEdition> = {
  sk: {
    hubMetaTitle: "Pre mňa",
    hubMetaDescription: "Vstupy — lekársky desk, verejnosť, výskum a legislatíva.",
    eyebrow: "Výber plochy",
    title: "Pre mňa",
    lead: "Štyri vstupy. Lekárska zóna je desk OrdiZapisu, nie starý personalizačný feed.",
    openFeed: "Otvoriť →",
    audiences: {
      lekari: { label: "Lekári", title: "Lekársky desk", description: "OrdiZapis, guidelines a štúdie. 14 dní zadarmo. Bez reklám." },
      pacienti: { label: "Verejnosť", title: "Feed pre čitateľov", description: "Zrozumiteľné súhrny z magazínu. Nenahrádza vyšetrenie." },
      vyzkum: { label: "Výskum", title: "Feed výskumu", description: "Štúdie s identifikátorom. Bez vymyslených výsledkov." },
      legislativa: { label: "Legislatíva", title: "Feed legislatívy", description: "Regulácia a dohľad. České inštitúcie tu nie sú miestna rada." },
    },
  },
  pl: {
    hubMetaTitle: "Dla mnie",
    eyebrow: "Wybierz powierzchnię",
    title: "Dla mnie",
    lead: "Cztery wejścia. Strefa lekarska to desk OrdiZapis, nie stary feed personalizacji.",
    openFeed: "Otwórz →",
    audiences: {
      lekari: { label: "Lekarze", title: "Desk lekarski", description: "OrdiZapis, wytyczne i badania. 14 dni za darmo. Bez reklam." },
      pacienti: { label: "Czytelnicy", title: "Feed dla czytelników", description: "Jasne skróty z magazynu. Nie zastępuje badania." },
      vyzkum: { label: "Badania", title: "Feed badań", description: "Studia z identyfikatorem. Bez wymyślonych wyników." },
      legislativa: { label: "Regulacje", title: "Feed regulacji", description: "Nadzór i przepisy. Czeskie instytucje nie są tu lokalną radą." },
    },
  },
  ja: {
    hubMetaTitle: "自分向け",
    eyebrow: "面を選ぶ",
    title: "自分向け",
    lead: "入口は4つ。医師ゾーンはOrdiZapisデスクであり、古いパーソナライズフィードではありません。",
    openFeed: "開く →",
    audiences: {
      lekari: { label: "医師", title: "医師デスク", description: "OrdiZapis、ガイドライン、研究。14日間無料。広告なし。" },
      pacienti: { label: "一般", title: "読者フィード", description: "雑誌のわかりやすい要約。診察の代わりではありません。" },
      vyzkum: { label: "研究", title: "研究フィード", description: "識別子付きの研究。捏造結果なし。" },
      legislativa: { label: "規制", title: "規制フィード", description: "監督と規則。チェコの機関はここでは現地の助言ではありません。" },
    },
  },
};

export function proMeEdition(primary: string): ProMeEdition | undefined {
  return EDITIONS[primary];
}
