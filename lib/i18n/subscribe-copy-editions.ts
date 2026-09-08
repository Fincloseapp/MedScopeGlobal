import type { SubscribeCopy } from "@/lib/i18n/subscribe-copy";

/** Visible /predplatne chrome for editions that still fall back to the English pack. */
export type SubscribeEdition = Partial<
  Pick<
    SubscribeCopy,
    | "metaTitle"
    | "metaDescription"
    | "eyebrow"
    | "title"
    | "lead"
    | "openApp"
    | "downloadApp"
    | "choosePlan"
    | "choosePlanLead"
    | "bestForClinic"
    | "mostPopular"
    | "daysFree"
    | "editorialBadge"
    | "startEditorialMonth"
    | "startEditorialYear"
    | "perMonth"
    | "yearly"
    | "perYear"
    | "twoMonthsFree"
    | "supportTitle"
    | "supportLead"
    | "supportCta"
    | "keepReading"
    | "comparisonTitle"
    | "comparisonLead"
    | "faqTitle"
    | "noAccountTitle"
    | "noAccountLead"
    | "createAccount"
    | "studentPlan"
    | "featureCol"
    | "included"
    | "notIncluded"
    | "faq"
    | "trustTitle"
    | "trust"
    | "privacy"
    | "terms"
    | "comparisonRows"
  >
> & {
  plans?: Partial<Record<keyof SubscribeCopy["plans"], { name?: string; features?: string[] }>>;
  audienceByApp?: Partial<SubscribeCopy["audienceByApp"]>;
  priceNoteByApp?: Partial<SubscribeCopy["priceNoteByApp"]>;
};

const EDITIONS: Record<string, SubscribeEdition> = {
  sk: {
    metaTitle: "Predplatné | ViaLongeVita",
    metaDescription:
      "Náhľad článkov o dlhovekosti. Tarif Redakcia 1 € mesačne alebo 10 € za rok, platba hneď. OrdiZapis a lekár: 14 dní. Zrušenie kedykoľvek. Platba kartou cez Stripe.",
    eyebrow: "Predplatné",
    title: "Dlhovekosť zrozumiteľne — tarif Redakcia",
    lead: "Úvod článku je zadarmo. Zvyšok otvorí Redakcia — mesačne, alebo ročne s dvoma mesiacmi v cene. OrdiZapis a lekár: 14 dní zadarmo. Zrušenie kedykoľvek.",
    openApp: "Otvoriť →",
    downloadApp: "Stiahnuť do mobilu",
    choosePlan: "Vyberte plán",
    choosePlanLead:
      "Redakcia: mesačne alebo ročne, text sa otvorí hneď. OrdiZapis a lekár: 14 dní zadarmo. Zrušíte kedykoľvek. Po kliknutí prejdete na Stripe.",
    bestForClinic: "Najvýhodnejšie pre ambulanciu",
    mostPopular: "Najobľúbenejšie",
    daysFree: "14 dní zadarmo",
    editorialBadge: "Hneď k dispozícii",
    startEditorialMonth: "Čítať mesiac",
    startEditorialYear: "Čítať celý rok",
    perMonth: "/ mesiac",
    yearly: "Ročné:",
    perYear: "/ rok",
    twoMonthsFree: "(≈ 2 mesiace zadarmo)",
    supportTitle: "Zatiaľ bez plánu — nechajte si náhľad",
    supportLead:
      "Úvod ostáva čitateľný. Zvyšok otvára tarif Redakcia — platba hneď 1 € mesačne alebo 10 € za rok. Tipy ostávajú dobrovoľné.",
    supportCta: "Otvoriť články o dlhovekosti",
    keepReading: "Čítať náhľad",
    comparisonTitle: "Porovnať plány",
    comparisonLead:
      "Funkcie podľa publika. Redakcia: platba hneď. OrdiZapis a lekár: 14 dní. Študent: 1 test zadarmo, úvodný mesiac, potom 10 €.",
    faqTitle: "Časté otázky",
    noAccountTitle: "Ešte nemáte účet?",
    noAccountLead: "Vytvorte si bezplatný účet, potom sa vráťte sem a vyberte plán.",
    createAccount: "Vytvoriť bezplatný účet",
    studentPlan: "Študent LF",
    plans: {
      public: {
        name: "Redakcia",
        features: [
          "Aktuálne zdravotné texty vo vašom jazyku",
          "Články o dlhovekosti, spánku, pohybe a strave",
          "MeDipacient — správy v telefóne",
          "AI asistent pre verejnosť",
          "Články bez reklám",
        ],
      },
      physician: { name: "Lekár v praxi" },
      student: { name: "Študent LF" },
      dokumentace: {
        name: "OrdiZapis",
        features: [
          "OrdiZapis: nahrávka v mobile — diktát alebo konzultácia → zápis",
          "Šablóny: ambulancia, SOAP, anamnéza…",
          "História zápisov v účte — sync telefón ↔ web",
          "Základné odborné briefy v aplikácii",
          "14 dní zadarmo — len tento plán OrdiZapis",
        ],
      },
    },
    audienceByApp: {
      medipacient: "Pacienti a rodiny",
      mediprep: "Uchádzači o medicínu",
      ordizapis: "Lekári a ambulancie",
      mediflow: "Verejnosť a dlhovekosť",
    },
    priceNoteByApp: {
      medipacient: "s tarifom Redakcia, potom",
      mediprep: "1 test zadarmo, úvodný mesiac, potom 10 €",
      ordizapis: "14 dní zadarmo, potom",
      mediflow: "s tarifom Redakcia",
    },
    featureCol: "Funkcia",
    included: "Zahrnuté",
    notIncluded: "Nezahrnuté",
    privacy: "Ochrana súkromia",
    terms: "Podmienky",
    trustTitle: "Bezpečná platba a súkromie",
    trust: [
      { title: "Platby cez Stripe", description: "Karta, Apple Pay a Google Pay. PCI-kompatibilný checkout." },
      { title: "GDPR a ochrana dát", description: "Spracovanie podľa pravidiel EÚ. Vaše dáta nepredávame." },
      { title: "Zrušenie kedykoľvek", description: "Predplatné spravujete v účte. Redakcia sa platí hneď. Bez skrytých poplatkov." },
    ],
    faq: [
      {
        q: "Ako funguje 14-dňová skúšobná verzia?",
        a: "OrdiZapis a lekár: po zadaní karty máte 14 dní zadarmo. Tarif Redakcia sa platí hneď — 1 € mesačne alebo 10 € za rok. Zrušíte kedykoľvek pred ďalším inkasom.",
      },
      {
        q: "Môžem predplatné kedykoľvek zrušiť?",
        a: "Áno. Zrušenie v sekcii Účet alebo v Stripe zákazníckom portáli. Prístup ostane aktívny do konca zaplateného obdobia.",
      },
      {
        q: "Aký tarif zvoliť?",
        a: "Redakcia (1 €) — aktuálne zdravotné texty a prevencia. Študent LF — materiály a AI tutor. Lekár v praxi — guidelines, CME a klinický AI.",
      },
    ],
    comparisonRows: [
      "Články magazínu bez reklám",
      "Verejný AI asistent",
      "Prevencia a životný štýl",
      "Kvízy a študijné plány",
      "AI tutor pre študentov medicíny",
      "Modelové otázky na prijímacky",
      "Odborný stôl a guidelines",
      "CME briefy a súhrny štúdií",
      "Klinický AI asistent",
      "OrdiZapis (AI zápisy)",
      "Research Hub a diagnostické algoritmy",
      "MedScope Academy (základné kurzy)",
      "Prioritné upozornenia",
    ],
  },
  pl: {
    metaTitle: "Prenumerata | ViaLongeVita",
    metaDescription:
      "Podgląd artykułów o długowieczności. Plan Redakcja 1 € miesięcznie lub 10 € rocznie, od razu. OrdiZapis i lekarz: 14 dni. Rezygnacja w każdej chwili.",
    eyebrow: "Prenumerata",
    title: "Długowieczność jasnym językiem — plan Redakcja",
    lead: "Początek artykułu jest darmowy. Resztę otwiera Redakcja — miesięcznie albo rocznie z dwoma miesiącami w cenie. OrdiZapis i lekarz: 14 dni za darmo. Rezygnacja w każdej chwili.",
    openApp: "Otwórz →",
    downloadApp: "Zainstaluj na telefonie",
    choosePlan: "Wybierz plan",
    choosePlanLead:
      "Redakcja: miesięcznie lub rocznie, tekst otwiera się od razu. OrdiZapis i lekarz: 14 dni za darmo. Rezygnacja w każdej chwili. Po kliknięciu przejdziesz do Stripe.",
    bestForClinic: "Najlepsza wartość dla gabinetu",
    mostPopular: "Najpopularniejsze",
    daysFree: "14 dni za darmo",
    editorialBadge: "Pełny tekst od razu",
    startEditorialMonth: "Czytaj miesiąc",
    startEditorialYear: "Czytaj cały rok",
    perMonth: "/ miesiąc",
    yearly: "Rocznie:",
    perYear: "/ rok",
    twoMonthsFree: "(≈ 2 miesiące gratis)",
    supportTitle: "Jeszcze bez planu — zostań przy podglądzie",
    supportLead:
      "Początek zostaje czytelny. Resztę otwiera plan Redakcja — 1 € miesięcznie lub 10 € rocznie, od razu. Napiwki zostają dobrowolne.",
    supportCta: "Otwórz artykuły o długowieczności",
    keepReading: "Czytaj podgląd",
    comparisonTitle: "Porównaj plany",
    comparisonLead:
      "Funkcje według odbiorców. Redakcja: płatność od razu. OrdiZapis i lekarz: 14 dni. Student: 1 darmowy test, miesiąc wprowadzający, potem 10 €.",
    faqTitle: "Najczęstsze pytania",
    noAccountTitle: "Nie masz jeszcze konta?",
    noAccountLead: "Załóż darmowe konto, wróć tutaj i wybierz plan.",
    createAccount: "Załóż darmowe konto",
    studentPlan: "Student medycyny",
    plans: {
      public: {
        name: "Redakcja",
        features: [
          "Aktualne teksty o zdrowiu w Twoim języku",
          "Artykuły o długowieczności, śnie, ruchu i jedzeniu",
          "MeDipacient — wyniki w telefonie",
          "Publiczny asystent AI",
          "Artykuły bez reklam",
        ],
      },
      physician: { name: "Lekarz praktykujący" },
      student: { name: "Student medycyny" },
      dokumentace: {
        name: "OrdiZapis",
        features: [
          "OrdiZapis: nagranie w telefonie — dyktando lub wizyta → notatka",
          "Szablony: poradnia, SOAP, wywiad…",
          "Historia notatek na koncie — sync telefon ↔ web",
          "Podstawowe briefy zawodowe w aplikacji",
          "14 dni za darmo — tylko ten plan OrdiZapis",
        ],
      },
    },
    audienceByApp: {
      medipacient: "Pacjenci i rodziny",
      ordizapis: "Lekarze i gabinety",
      mediflow: "Czytelnicy i długowieczność",
    },
    priceNoteByApp: {
      medipacient: "z planem Redakcja, potem",
      mediprep: "1 darmowy test, miesiąc wprowadzający, potem 10 €",
      ordizapis: "14 dni za darmo, potem",
      mediflow: "z planem Redakcja",
    },
    featureCol: "Funkcja",
    included: "Zawarte",
    notIncluded: "Niezawarte",
    privacy: "Prywatność",
    terms: "Regulamin",
    trustTitle: "Bezpieczna płatność i prywatność",
    trust: [
      { title: "Płatności przez Stripe", description: "Karta, Apple Pay i Google Pay. Checkout zgodny z PCI." },
      { title: "RODO i ochrona danych", description: "Przetwarzanie według zasad UE. Nie sprzedajemy Twoich danych." },
      { title: "Rezygnacja w każdej chwili", description: "Subskrypcją zarządzasz na koncie. Redakcja jest płatna od razu." },
    ],
    faq: [
      {
        q: "Jak działa 14-dniowy okres próbny?",
        a: "OrdiZapis i lekarz: po podaniu karty masz 14 dni za darmo. Plan Redakcja jest płatny od razu — 1 € miesięcznie lub 10 € rocznie. Rezygnacja przed kolejną opłatą.",
      },
      {
        q: "Czy mogę zrezygnować w każdej chwili?",
        a: "Tak. Rezygnacja w koncie lub w portalu Stripe. Dostęp zostaje do końca opłaconego okresu.",
      },
      {
        q: "Który plan wybrać?",
        a: "Redakcja (1 €) — aktualne teksty o zdrowiu. Student medycyny — materiały i tutor AI. Lekarz praktykujący — wytyczne, CME i kliniczne AI.",
      },
    ],
    comparisonRows: [
      "Artykuły magazynu bez reklam",
      "Publiczny asystent AI",
      "Profilaktyka i styl życia",
      "Quizy i plany nauki",
      "Tutor AI dla studentów medycyny",
      "Pytania modelowe na rekrutację",
      "Biurko zawodowe i wytyczne",
      "Briefy CME i streszczenia badań",
      "Kliniczny asystent AI",
      "OrdiZapis (notatki AI)",
      "Research Hub i algorytmy",
      "MedScope Academy (kursy podstawowe)",
      "Priorytetowe powiadomienia",
    ],
  },
  ja: {
    metaTitle: "購読 | ViaLongeVita",
    metaDescription:
      "長寿記事は冒頭が読めます。編集部プランは月1€または年10€、すぐに課金。OrdiZapisと医師は14日。いつでも解約。Stripeでカード決済。",
    eyebrow: "購読",
    title: "長寿をわかりやすく — 編集部プラン",
    lead: "記事の冒頭は無料です。続きは編集部が開きます — 月額、または2か月分込みの年額。OrdiZapisと医師は14日無料。いつでも解約できます。",
    openApp: "開く →",
    downloadApp: "モバイルにインストール",
    choosePlan: "プランを選ぶ",
    choosePlanLead:
      "編集部：月額または年額で本文はすぐ開きます。OrdiZapisと医師：14日無料。いつでも解約。クリック後にStripeへ進みます。",
    bestForClinic: "診療所に最もお得",
    mostPopular: "いちばん選ばれている",
    daysFree: "14日間無料",
    editorialBadge: "本文はすぐ",
    startEditorialMonth: "1か月読む",
    startEditorialYear: "1年読む",
    perMonth: "/ 月",
    yearly: "年額：",
    perYear: "/ 年",
    twoMonthsFree: "（約2か月分お得）",
    supportTitle: "まだプランなし — プレビューのまま",
    supportLead:
      "冒頭はそのまま読めます。続きは編集部プランで開きます — 月1€または年10€、すぐに課金。チップは任意です。",
    supportCta: "長寿の記事を開く",
    keepReading: "プレビューを読む",
    comparisonTitle: "プランを比較",
    comparisonLead:
      "対象別の機能。編集部はすぐ課金。OrdiZapisと医師は14日。学生は無料テスト1回、導入月のあと10€。",
    faqTitle: "よくある質問",
    noAccountTitle: "まだアカウントがありませんか？",
    noAccountLead: "無料アカウントを作り、ここに戻ってプランを選んでください。",
    createAccount: "無料アカウントを作る",
    studentPlan: "医学生",
    plans: {
      public: {
        name: "編集部",
        features: [
          "あなたの言語での最新の健康記事",
          "長寿、睡眠、動き、食事の記事",
          "MeDipacient — スマホで検査結果",
          "一般向けAIアシスタント",
          "広告なしの記事",
        ],
      },
      physician: { name: "開業医" },
      student: { name: "医学生" },
      dokumentace: {
        name: "OrdiZapis",
        features: [
          "OrdiZapis：スマホで録音 — 口述または診察 → 記録",
          "テンプレート：外来、SOAP、問診…",
          "アカウント内の記録履歴 — 電話 ↔ ウェブ同期",
          "アプリ内の基本的な専門ブリーフ",
          "14日間無料 — この OrdiZapis プランのみ",
        ],
      },
    },
    audienceByApp: {
      medipacient: "患者と家族",
      ordizapis: "医師とクリニック",
      mediflow: "一般と長寿",
    },
    priceNoteByApp: {
      medipacient: "編集部プランのあと",
      mediprep: "無料テスト1回、導入月のあと10€",
      ordizapis: "14日間無料、その後",
      mediflow: "編集部プランで",
    },
    featureCol: "機能",
    included: "含まれる",
    notIncluded: "含まれない",
    privacy: "プライバシー",
    terms: "利用規約",
    trustTitle: "安全な支払いとプライバシー",
    trust: [
      { title: "Stripeで支払い", description: "カード、Apple Pay、Google Pay。PCI準拠の決済。" },
      { title: "GDPRとデータ保護", description: "EU規則に従い処理します。データを販売しません。" },
      { title: "いつでも解約", description: "アカウントで購読を管理。編集部はすぐ課金。" },
    ],
    faq: [
      {
        q: "14日間の無料期間はどうなりますか？",
        a: "OrdiZapisと医師：カード登録後14日は無料。編集部プランはすぐ課金 — 月1€または年10€。次回課金の前ならいつでも解約できます。",
      },
      {
        q: "いつでも解約できますか？",
        a: "はい。アカウントまたはStripeのカスタマーポータルから。支払済み期間の終わりまで使えます。",
      },
      {
        q: "どのプランを選べばよいですか？",
        a: "編集部（1€）— 健康と予防の記事。医学生 — 教材とAIチューター。開業医 — ガイドライン、CME、臨床AI。",
      },
    ],
    comparisonRows: [
      "広告なしの雑誌記事",
      "一般向けAIアシスタント",
      "予防と生活習慣",
      "クイズと学習プラン",
      "医学生向けAIチューター",
      "入試のモデル問題",
      "専門デスクとガイドライン",
      "CMEブリーフと研究要約",
      "臨床AIアシスタント",
      "OrdiZapis（AI記録）",
      "Research Hubと診断アルゴリズム",
      "MedScope Academy（基本講座）",
      "優先通知",
    ],
  },
  ru: {
    metaTitle: "Подписка | ViaLongeVita",
    eyebrow: "Подписка",
    title: "Долголетие понятным языком — тариф Редакция",
    lead: "Начало статьи бесплатно. Остальное открывает Редакция — помесячно или за год с двумя месяцами в цене. OrdiZapis и врач: 14 дней бесплатно. Отмена в любой момент.",
    choosePlan: "Выберите план",
    choosePlanLead: "Редакция: помесячно или за год, текст открывается сразу. OrdiZapis и врач: 14 дней бесплатно. Отмена в любой момент.",
    mostPopular: "Самый популярный",
    daysFree: "14 дней бесплатно",
    startEditorialMonth: "Читать месяц",
    startEditorialYear: "Читать год",
    perMonth: "/ месяц",
    yearly: "Год:",
    perYear: "/ год",
    twoMonthsFree: "(≈ 2 месяца бесплатно)",
    supportTitle: "Пока без плана — оставьте превью",
    supportLead: "Начало остаётся читаемым. Остальное открывает тариф Редакция — 1 € в месяц или 10 € в год сразу. Чаевые добровольные.",
    supportCta: "Открыть статьи о долголетии",
    comparisonTitle: "Сравнить планы",
    faqTitle: "Частые вопросы",
    downloadApp: "Установить на телефон",
    createAccount: "Создать бесплатный аккаунт",
    plans: { public: { name: "Редакция" } },
  },
  "zh-CN": {
    metaTitle: "订阅 | ViaLongeVita",
    eyebrow: "订阅",
    title: "把长寿讲清楚 — 编辑部方案",
    lead: "文章开头免费。其余由编辑部打开 — 按月，或年付含两个月。OrdiZapis 与医生：14 天免费。可随时取消。",
    choosePlan: "选择方案",
    mostPopular: "最受欢迎",
    daysFree: "14 天免费",
    startEditorialMonth: "读一个月",
    startEditorialYear: "读一年",
    perMonth: "/ 月",
    yearly: "年付：",
    perYear: "/ 年",
    supportTitle: "先不订阅 — 保留预览",
    supportLead: "开头仍可读。其余由编辑部方案打开 — 每月 1€ 或每年 10€，立即计费。打赏出于自愿。",
    supportCta: "打开长寿文章",
    comparisonTitle: "对比方案",
    faqTitle: "常见问题",
    downloadApp: "安装到手机",
    plans: { public: { name: "编辑部" } },
  },
  ro: {
    eyebrow: "Abonament",
    title: "Longevitate pe înțelesul tuturor — planul Redacție",
    choosePlan: "Alegeți un plan",
    mostPopular: "Cel mai popular",
    daysFree: "14 zile gratuit",
    yearly: "Anual:",
    supportTitle: "Încă fără plan — păstrați previzualizarea",
    comparisonTitle: "Comparați planurile",
    faqTitle: "Întrebări frecvente",
    plans: { public: { name: "Redacție" } },
  },
  hu: {
    eyebrow: "Előfizetés",
    title: "Hosszú élet közérthetően — Szerkesztőségi csomag",
    choosePlan: "Válasszon csomagot",
    mostPopular: "Legnépszerűbb",
    daysFree: "14 nap ingyen",
    yearly: "Éves:",
    supportTitle: "Még nincs csomag — maradjon az előnézet",
    comparisonTitle: "Csomagok összehasonlítása",
    faqTitle: "Gyakori kérdések",
    plans: { public: { name: "Szerkesztőség" } },
  },
  ko: {
    eyebrow: "구독",
    title: "장수를 쉽게 — 편집부 요금제",
    choosePlan: "요금제 선택",
    mostPopular: "가장 인기",
    daysFree: "14일 무료",
    yearly: "연간:",
    supportTitle: "아직 요금제 없음 — 미리보기 유지",
    comparisonTitle: "요금제 비교",
    faqTitle: "자주 묻는 질문",
    plans: { public: { name: "편집부" } },
  },
};

export function subscribeEdition(pack: string): SubscribeEdition | undefined {
  return EDITIONS[pack];
}
