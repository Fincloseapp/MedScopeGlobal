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
      public: { name: "Redakcia" },
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
      ordizapis: "14 dní zadarmo, potom",
      mediflow: "s tarifom Redakcia",
    },
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
      public: { name: "Redakcja" },
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
      ordizapis: "14 dni za darmo, potem",
      mediflow: "z planem Redakcja",
    },
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
      public: { name: "編集部" },
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
      ordizapis: "14日間無料、その後",
      mediflow: "編集部プランで",
    },
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
