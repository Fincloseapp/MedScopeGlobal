import type { AiAssistantCopy } from "@/lib/i18n/ai-assistant-copy";

export type AiAssistantEdition = Partial<
  Pick<
    AiAssistantCopy,
    | "hubMetaTitle"
    | "hubMetaDescription"
    | "hubTitle"
    | "hubLead"
    | "publicMetaTitle"
    | "publicMetaDescription"
    | "publicEyebrow"
    | "publicTitle"
    | "publicLead"
    | "publicCta"
    | "publicBack"
    | "publicExamplesTitle"
    | "publicExamples"
    | "publicConsoleTitle"
    | "allAssistants"
    | "queryLabel"
    | "publicPlaceholder"
    | "ask"
    | "run"
    | "loading"
    | "answer"
    | "publicHint"
  >
> & {
  cards?: AiAssistantCopy["cards"];
};

const EDITIONS: Record<string, AiAssistantEdition> = {
  sk: {
    hubMetaTitle: "AI asistenti | MedScopeGlobal",
    hubMetaDescription: "Verejný a klinický AI asistent — vzdelávacie nástroje, nie diagnóza.",
    hubTitle: "AI asistenti MedScope",
    hubLead: "Špecializované asistentky na AI Medical engine. Nediagnostikujú — pomáhajú sa zorientovať.",
    cards: [
      { href: "/ai-asistent/verejnost", label: "AI pre verejnosť", desc: "Prevencia, symptómy, životný štýl — zrozumiteľné odpovede", color: "from-emerald-600 to-teal-700" },
      { href: "/ai-asistent/lekar", label: "Klinické AI pre lekárov", desc: "Guidelines, diferenciálna diagnostika, štúdie", color: "from-[#021d33] to-[#005B96]" },
    ],
    publicMetaTitle: "AI asistent pre verejnosť | MedScopeGlobal",
    publicMetaDescription: "Opýtajte sa AI na prevenciu, výživu, spánok a životný štýl — zrozumiteľne, bez žargónu.",
    publicEyebrow: "Verejné zdravie",
    publicTitle: "Opýtajte sa AI — zrozumiteľné odpovede o zdraví",
    publicLead: "Napíšte otázku o prevencii, symptómoch alebo životnom štýle. Odpovede sú vzdelávacie a nenahrádzajú návštevu lekára.",
    publicCta: "Nájdite svoju tému",
    publicBack: "← Späť na verejnú sekciu",
    publicExamplesTitle: "Príklady otázok",
    publicExamples: ["Ako zlepšiť kvalitu spánku?", "Čo znamenajú bežné príznaky chrípky?", "Aké sú základy zdravej výživy?"],
    publicConsoleTitle: "Verejný AI asistent",
    allAssistants: "← Všetci asistenti",
    queryLabel: "Vaša otázka",
    publicPlaceholder: "Napr.: Čo robiť pri bolesti hlavy? Ako zlepšiť spánok?",
    ask: "Opýtať sa",
    run: "Spustiť asistenta",
    loading: "Pripravujem odpoveď…",
    answer: "Odpoveď",
    publicHint: "Napíšte otázku zrozumiteľne. Odpoveď ostane čitateľná — bez výberu špecializácie.",
  },
  pl: {
    hubTitle: "Asystenci AI MedScope",
    hubLead: "Specjalistyczni asystenci na silniku AI Medical. Nie stawiają diagnozy — pomagają się zorientować.",
    cards: [
      { href: "/ai-asistent/verejnost", label: "AI dla czytelników", desc: "Profilaktyka, objawy, styl życia — proste odpowiedzi", color: "from-emerald-600 to-teal-700" },
      { href: "/ai-asistent/lekar", label: "AI kliniczne dla lekarzy", desc: "Wytyczne, diagnostyka różnicowa, badania", color: "from-[#021d33] to-[#005B96]" },
    ],
    publicMetaTitle: "Asystent AI dla czytelników | MedScopeGlobal",
    publicMetaDescription: "Zapytaj AI o profilaktykę, jedzenie, sen i styl życia — jasnym językiem, bez żargonu.",
    publicEyebrow: "Zdrowie publiczne",
    publicTitle: "Zapytaj AI — proste odpowiedzi o zdrowiu",
    publicLead: "Napisz pytanie o profilaktykę, objawy albo styl życia. Odpowiedzi są edukacyjne i nie zastępują wizyty u lekarza.",
    publicCta: "Znajdź swój temat",
    publicBack: "← Wróć do części publicznej",
    publicExamplesTitle: "Przykładowe pytania",
    publicExamples: ["Jak lepiej spać?", "Co oznaczają częste objawy grypy?", "Jakie są podstawy zdrowego jedzenia?"],
    publicConsoleTitle: "Publiczny asystent AI",
    ask: "Zapytaj",
    publicHint: "Napisz pytanie prostym językiem. Odpowiedź zostaje czytelna — bez wyboru specjalności.",
  },
  ja: {
    hubTitle: "MedScopeのAIアシスタント",
    hubLead: "AI Medicalエンジン上の専門アシスタント。診断はしません — 見当をつける助けです。",
    cards: [
      { href: "/ai-asistent/verejnost", label: "一般向けAI", desc: "予防、症状、生活習慣 — わかりやすい答え", color: "from-emerald-600 to-teal-700" },
      { href: "/ai-asistent/lekar", label: "医師向け臨床AI", desc: "ガイドライン、鑑別診断、研究", color: "from-[#021d33] to-[#005B96]" },
    ],
    publicMetaTitle: "一般向けAIアシスタント | MedScopeGlobal",
    publicMetaDescription: "予防、食事、睡眠、生活習慣をAIに聞く — わかりやすい言葉で、専門用語なし。",
    publicEyebrow: "公衆衛生",
    publicTitle: "AIに聞く — 健康についてわかりやすく",
    publicLead: "予防、症状、生活習慣の質問を書いてください。答えは教育目的であり、受診の代わりではありません。",
    publicCta: "テーマを探す",
    publicBack: "← 一般セクションへ戻る",
    publicExamplesTitle: "質問の例",
    publicExamples: ["睡眠の質を上げるには？", "よくある風邪の症状は何を意味する？", "健康的な食事の基本は？"],
    publicConsoleTitle: "一般向けAIアシスタント",
    ask: "聞く",
    publicHint: "わかりやすい言葉で質問してください。答えはそのまま読めます — 専門の選択は不要です。",
  },
};

export function aiAssistantEdition(primary: string): AiAssistantEdition | undefined {
  return EDITIONS[primary];
}
