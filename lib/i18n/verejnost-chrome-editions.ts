import type { VerejnostChrome } from "@/lib/i18n/verejnost-chrome";

export type VerejnostEdition = Partial<
  Pick<
    VerejnostChrome,
    | "publicKicker"
    | "fallbackTopic"
    | "articlesBack"
    | "teaserContinue"
    | "teaserCta"
    | "ctaPublic"
    | "ctaMagazine"
    | "allArticles"
    | "videoOverlayHeadline"
    | "videoOverlayCta"
    | "videoOverlayBody"
    | "topicFilterLead"
    | "allArticlesLead"
    | "temataEyebrow"
    | "temataTitle"
    | "temataLead"
    | "interviewsEyebrow"
    | "interviewsTitle"
    | "interviewsLead"
    | "articlesNavTitle"
    | "articlesNavDesc"
    | "notMedicalAdvice"
    | "emptyListing"
  >
> & {
  hubs?: Partial<{
    clanky: Partial<VerejnostChrome["hubs"]["clanky"]>;
  }>;
};

const EDITIONS: Record<string, VerejnostEdition> = {
  sk: {
    publicKicker: "Verejnosť",
    fallbackTopic: "Verejné zdravie",
    articlesBack: "← Verejné zdravie — články",
    teaserContinue: "Úvod ostáva čitateľný. Zvyšok textu otvára tarif Redakcia.",
    teaserCta: "Pokračovať s Redakciou",
    ctaPublic: "Verejné zdravie",
    ctaMagazine: "Články magazínu",
    allArticles: "Všetky články",
    videoOverlayHeadline: "Pokračovať s tarifom Redakcia",
    videoOverlayCta: "Otvoriť tarif Redakcia",
    videoOverlayBody: "Začiatok lekcie ostáva otvorený. Magazín a ďalšie čítanie otvára Redakcia.",
    topicFilterLead: "Články v tejto rubrike — zrozumiteľne, s redakčnou kontrolou.",
    allArticlesLead: "Prehliadajte podľa témy alebo zobrazte všetky publikované články.",
    temataEyebrow: "Katalóg",
    temataTitle: "Všetky témy verejného zdravia",
    temataLead: "Vyberte oblasť, ktorá vás zaujíma — každá téma má zrozumiteľné články pre každého.",
    interviewsEyebrow: "Rozhovory",
    interviewsTitle: "Rozhovory s odborníkmi",
    interviewsLead: "Lekári, psychológovia a špecialisti vysvetľujú prevenciu zrozumiteľne.",
    articlesNavTitle: "Najnovšie z verejného magazínu",
    articlesNavDesc: "Dlhé texty z toho istého stola — zrozumiteľne, s redakčnou kontrolou a overiteľnými zdrojmi.",
    notMedicalAdvice: "Tieto informácie nenahrádzajú lekársku starostlivosť · medscopeglobal.com",
    emptyListing: "Verejné články tu čoskoro pribudnú — sledujte medscopeglobal.com.",
    hubs: {
      clanky: {
        title: "Články pre všetkých",
        heroDeck: "Aktuálne texty o prevencii, chorobách, životnom štýle a dlhovekosti — zrozumiteľne, s redakčnou kontrolou.",
        primaryCta: "Prehliadať články",
      },
    },
  },
  pl: {
    publicKicker: "Dla wszystkich",
    fallbackTopic: "Zdrowie publiczne",
    articlesBack: "← Zdrowie publiczne — artykuły",
    teaserContinue: "Początek zostaje czytelny. Resztę otwiera plan Redakcja.",
    teaserCta: "Kontynuuj z Redakcją",
    ctaPublic: "Zdrowie publiczne",
    allArticles: "Wszystkie artykuły",
    videoOverlayHeadline: "Kontynuuj z planem Redakcja",
    videoOverlayCta: "Otwórz plan Redakcja",
    topicFilterLead: "Artykuły w tej rubryce — jasnym językiem, z recenzją redakcyjną.",
    temataTitle: "Wszystkie tematy zdrowia publicznego",
    temataLead: "Wybierz obszar — każdy temat ma artykuły jasnym językiem.",
    interviewsTitle: "Rozmowy z ekspertami",
    interviewsLead: "Lekarze, psycholodzy i specjaliści wyjaśniają profilaktykę jasnym językiem.",
    articlesNavDesc: "Długie teksty z tego samego biurka — jasnym językiem, recenzja redakcyjna.",
    notMedicalAdvice: "Te informacje nie zastępują opieki lekarskiej · medscopeglobal.com",
    hubs: {
      clanky: {
        title: "Artykuły dla wszystkich",
        primaryCta: "Przeglądaj artykuły",
      },
    },
  },
  ja: {
    publicKicker: "一般向け",
    fallbackTopic: "公衆衛生",
    articlesBack: "← 公衆衛生 — 記事",
    teaserContinue: "冒頭はそのまま読めます。続きは編集部プランで開きます。",
    teaserCta: "編集部で続ける",
    ctaPublic: "公衆衛生",
    allArticles: "すべての記事",
    videoOverlayHeadline: "編集部プランで続ける",
    videoOverlayCta: "編集部プランを開く",
    topicFilterLead: "この欄の記事 — わかりやすく、編集審査済み。",
    temataTitle: "公衆衛生のすべてのテーマ",
    temataLead: "気になる分野を選ぶ — どのテーマもわかりやすい記事があります。",
    interviewsTitle: "専門家インタビュー",
    interviewsLead: "医師、心理士、専門家が予防をわかりやすく説明します。",
    articlesNavDesc: "同じデスクの長文 — わかりやすく、編集審査、確認できる出典。",
    notMedicalAdvice: "この情報は医療の代わりではありません · medscopeglobal.com",
    hubs: {
      clanky: {
        title: "すべての人向け記事",
        primaryCta: "記事を見る",
      },
    },
  },
  ru: {
    publicKicker: "Для всех",
    fallbackTopic: "Общественное здоровье",
    teaserContinue: "Начало остаётся читаемым. Остальное открывает тариф Редакция.",
    teaserCta: "Продолжить с Редакцией",
    ctaPublic: "Общественное здоровье",
    hubs: { clanky: { title: "Статьи для всех" } },
  },
  zh: {
    publicKicker: "大众",
    fallbackTopic: "公共卫生",
    teaserContinue: "开头仍可读。其余由编辑部方案打开。",
    teaserCta: "用编辑部继续",
    ctaPublic: "公共卫生",
    hubs: { clanky: { title: "面向所有人的文章" } },
  },
};

export function verejnostEdition(primary: string): VerejnostEdition | undefined {
  return EDITIONS[primary];
}
