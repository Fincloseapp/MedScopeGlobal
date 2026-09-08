import type { InzerceCenikCopy } from "@/lib/i18n/inzerce-cenik-copy";

export type InzerceCenikEdition = Partial<Omit<InzerceCenikCopy, "catalog">> & {
  catalog?: Partial<InzerceCenikCopy["catalog"]>;
};

const EDITIONS: Record<string, InzerceCenikEdition> = {
  sk: {
    metaTitle: "Cenník inzercie",
    metaDescription: "Ceny bannerov, newsletteru a kombinovaných balíčkov.",
    eyebrow: "Cenník",
    title: "Cenník reklamy",
    lead: "Orientačné ceny za 30 dní. Finálna cena sa potvrdí vo formulári s automatickým nacenením.",
    cta: "Spočítať a odoslať",
    starterTitle: "ViaLongeVita — štartovacie sadzby",
    starterLead: "Orientačné sadzby pre čitateľov dlhovekosti. Nižšie je širší sadzobník.",
    native: "Native banner",
    sponsored: "Sponzorovaný článok",
    mention: "Mention v newslettri",
    perMonth: "/ mesiac",
    banners: "Bannery",
    newsletter: "Newsletter",
    packages: "Kombinované balíčky",
    from: "od",
    form: "Prejsť na formulár →",
  },
  pl: {
    metaTitle: "Cennik reklamy",
    metaDescription: "Ceny bannerów, newslettera i pakietów.",
    eyebrow: "Cennik",
    title: "Cennik reklamy",
    lead: "Ceny orientacyjne za 30 dni. Ostateczna cena potwierdza się w formularzu z automatyczną wyceną.",
    cta: "Oblicz i wyślij",
    starterTitle: "ViaLongeVita — stawki startowe",
    starterLead: "Stawki orientacyjne dla czytelników długowieczności. Poniżej szerszy cennik.",
    sponsored: "Artykuł sponsorowany",
    mention: "Wzmianka w newsletterze",
    perMonth: "/ miesiąc",
    banners: "Bannery",
    packages: "Pakiety łączone",
    from: "od",
    form: "Przejdź do formularza →",
  },
  ja: {
    metaTitle: "広告料金",
    metaDescription: "バナー、ニュースレター、パッケージの料金。",
    eyebrow: "料金",
    title: "広告料金表",
    lead: "30日の目安価格。最終金額は自動見積もりフォームで確定します。",
    cta: "計算して送る",
    starterTitle: "ViaLongeVita — スタート料金",
    starterLead: "長寿読者向けの目安。下に広い料金表があります。",
    sponsored: "スポンサード記事",
    mention: "ニュースレターでの言及",
    perMonth: "/ 月",
    banners: "バナー",
    packages: "組み合わせパッケージ",
    from: "から",
    form: "フォームへ →",
  },
};

export function inzerceCenikEdition(primary: string): InzerceCenikEdition | undefined {
  return EDITIONS[primary];
}
