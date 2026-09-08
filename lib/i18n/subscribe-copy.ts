import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizeCurrencyToken, localizeListedCzkIn } from "@/lib/i18n/payment-currency";
import { rewriteCzechInstitutions } from "@/lib/i18n/local-regulator";
import { editorialMonthlyBannerPrice } from "@/lib/editorial/pricing";
import { subscribeEdition } from "@/lib/i18n/subscribe-copy-editions";
import type { V27SubscriptionTier } from "@/lib/v27/config";

export type SubscribePlanCopy = {
  name: string;
  features: string[];
  extraNote?: string;
};

export type SubscribeCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  trialFromCta: string;
  studentPlan: string;
  trialFromCtaRest: string;
  parentsTip: string;
  parentsBodyBefore: string;
  selfTest: string;
  parentsBodyMid: string;
  parentsMore: string;
  openApp: string;
  downloadApp: string;
  choosePlan: string;
  choosePlanLead: string;
  bestForClinic: string;
  mostPopular: string;
  daysFree: string;
  editorialBadge: string;
  bannerKicker: string;
  bannerTitle: string;
  bannerLead: string;
  bannerPayCta: string;
  bannerPayBusy: string;
  billedNow: string;
  startEditorialMonth: string;
  startEditorialYear: string;
  studentBadge: string;
  firstMonth: string;
  thenMonthly: string;
  startStudentMonth: string;
  afterStudentIntro: string;
  perMonth: string;
  yearly: string;
  perYear: string;
  twoMonthsFree: string;
  startTrialMonth: string;
  startTrialYear: string;
  startOrdiZapis: string;
  afterTrial: string;
  afterTrialUnit: string;
  currencyLabel: string;
  cancelAnytime: string;
  supportTitle: string;
  supportLead: string;
  supportCta: string;
  keepReading: string;
  comparisonTitle: string;
  comparisonLead: string;
  featureCol: string;
  included: string;
  notIncluded: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  trustTitle: string;
  trustAria: string;
  trust: { title: string; description: string }[];
  privacy: string;
  terms: string;
  noAccountTitle: string;
  noAccountLead: string;
  createAccount: string;
  b2bNote: string;
  contact: string;
  plans: Record<V27SubscriptionTier, SubscribePlanCopy>;
  comparisonRows: string[];
  audienceByApp: Record<string, string>;
  priceNoteByApp: Record<string, string>;
};

function pack(locale?: string | null): string {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  return primary === "cs" ? "cs" : primary;
}

const COPY: Record<string, SubscribeCopy> = {
  cs: {
    metaTitle: "Předplatné | ViaLongeVita",
    metaDescription:
      "Náhled článků o dlouhověkosti. Redakce 25 Kč (1 € / 1 $) nebo 250 Kč/rok, platba ihned. OrdiZapis a lékař: 14 dní. Student LF: 1 test, 89 Kč, pak 149 Kč. Zrušení kdykoli. Platba kartou přes Stripe.",
    eyebrow: "Předplatné",
    title: "Dlouhověkost srozumitelně — tarif Redakce",
    lead: "Úvod článku je zdarma. Zbytek otevře Redakce — 25 Kč na měsíc, nebo 250 Kč na rok se dvěma měsíci v ceně. OrdiZapis a lékař: 14 dní zdarma. Student LF: 1 test zdarma, první měsíc 89 Kč, další 149 Kč. Zrušení kdykoli.",
    trialFromCta: "Přicházíte z trial CTA — níže je zvýrazněný tarif",
    studentPlan: "Student LF",
    trialFromCtaRest: "(příprava na přijímačky i studium). Rodiče: účet založte na jméno studenta.",
    parentsTip: "Tip pro rodiče a uchazeče",
    parentsBodyBefore: "Tarif Student LF otevírá Academy, AI tutor a kvízy. Nejdřív vyzkoušejte",
    selfTest: "self-test",
    parentsBodyMid: "a jeden test zdarma — pak dává předplatné smysl.",
    parentsMore: "Více pro rodiče",
    openApp: "Otevřít →",
    downloadApp: "Stáhnout na mobil",
    choosePlan: "Vyberte plán",
    choosePlanLead: "Redakce: 25 Kč/měsíc nebo 250 Kč/rok, text hned. OrdiZapis a lékař: 14 dní zdarma. Student LF: 1 test zdarma, první měsíc 89 Kč, další 149 Kč. Zrušíte kdykoli. Po kliknutí přejdete na Stripe.",
    bestForClinic: "Nejvýhodnější pro ordinaci",
    mostPopular: "Nejoblíbenější",
    daysFree: "14 dní zdarma",
    editorialBadge: "Hned k dispozici",
    bannerKicker: "Redakce ViaLongeVita",
    bannerTitle: "Zbytek článku máte hned — jen za {price}",
    bannerLead:
      "Měsíčně jen {price}. Roční přístup má dva měsíce v ceně. Kartou se text otevře teď — zrušíte kdykoli.",
    bannerPayCta: "Zaplatit {price} a číst",
    bannerPayBusy: "Otevírám platbu…",
    billedNow: "Otevře se hned",
    startEditorialMonth: "Číst měsíc",
    startEditorialYear: "Číst celý rok",
    studentBadge: "1 test zdarma · 89 Kč",
    firstMonth: "první měsíc",
    thenMonthly: "pak",
    startStudentMonth: "Začít první měsíc — 89 Kč",
    afterStudentIntro: "Další měsíc",
    perMonth: "/ měsíc",
    yearly: "Roční:",
    perYear: "/ rok",
    twoMonthsFree: "(≈ 2 měsíce zdarma)",
    startTrialMonth: "Začít 14denní trial — měsíčně",
    startTrialYear: "Začít trial — ročně",
    startOrdiZapis: "Začít 14 dní zdarma — 390 Kč",
    afterTrial: "Po 14 dnech",
    afterTrialUnit: "Kč/měs.",
    currencyLabel: "Kč",
    cancelAnytime: "zrušení kdykoli",
    supportTitle: "Nechcete předplatné hned? Stačí náhled",
    supportLead:
      "Úvod článku zůstává čitelný. Zbytek textu otevírá tarif Redakce — 25 Kč měsíčně nebo 250 Kč za rok (1 € / 10 €). Tip u článku je pořád dobrovolný.",
    supportCta: "Otevřít články o dlouhověkosti",
    keepReading: "Číst náhled",
    comparisonTitle: "Srovnání tarifů",
    comparisonLead:
      "Přehled funkcí podle cílové skupiny. Redakce: platba ihned. OrdiZapis a Lékař: 14denní zkušební verze. Student LF: 1 test zdarma, 89 Kč, pak 149 Kč. OrdiZapis (390 Kč) je samostatný nástroj pro zápisy; Lékař v praxi (490 Kč) přidává CME, Research Hub a klinický AI.",
    featureCol: "Funkce",
    included: "Zahrnuto",
    notIncluded: "Nezahrnuto",
    faqTitle: "Časté dotazy",
    faq: [
      {
        q: "Jak funguje 14denní zkušební verze?",
        a: "OrdiZapis a lékař: po zadání karty máte 14 dní zdarma, pak se spustí předplatné. Tarif Redakce se platí hned — 25 Kč měsíčně nebo 250 Kč za rok. Student LF nemá 14denní trial — 1 test zdarma, první měsíc 89 Kč, další měsíce 149 Kč. Zrušíte kdykoli před dalším inkasem.",
      },
      {
        q: "Mohu předplatné kdykoli zrušit?",
        a: "Ano. Zrušení probíhá v sekci Účet nebo ve Stripe zákaznickém portálu. Přístup zůstane aktivní do konce zaplaceného období.",
      },
      {
        q: "Jaký tarif zvolit?",
        a: "Redakce (25 Kč, v zahraničí 1 € nebo 1 $) — aktuální zdravotní texty, prevence a AI pro laiky. Student LF (89 Kč první měsíc, pak 149 Kč / v EU 10 €) — materiály, kvízy a AI tutor. Lékař v praxi (490 Kč) — odborná sekce, guidelines, CME a klinický AI.",
      },
      {
        q: "Mohu předplatné koupit jako rodič pro dítě?",
        a: "Ano. Na /studenti/darkove koupíte Student LF (89 Kč, pak 149 Kč) a po platbě přepošlete aktivační odkaz. Student ho otevře na svém účtu. Nezaručuje přijetí na medicínu.",
      },
      {
        q: "Jaké platební metody podporujete?",
        a: "Platby zpracovává Stripe: platební karta (Visa, Mastercard), Apple Pay a Google Pay. Údaje o kartě neukládáme na našich serverech.",
      },
      {
        q: "Je roční plán výhodnější?",
        a: "Ano — roční předplatné odpovídá 10 měsícům ceny (≈ 2 měsíce zdarma). Např. tarif Student LF: 1 490 Kč/rok místo 1 788 Kč při měsíční platbě.",
      },
      {
        q: "Potřebuji účet před platbou?",
        a: "Doporučujeme se nejprve zaregistrovat, poté zvolit tarif zde. U tarifu pro lékaře může být vyžadováno ověření profese (ČLK).",
      },
    ],
    trustTitle: "Bezpečná platba a ochrana soukromí",
    trustAria: "Důvěryhodnost plateb",
    trust: [
      { title: "Platby přes Stripe", description: "Karta, Apple Pay a Google Pay. Bezpečná PCI-kompatibilní platba." },
      { title: "GDPR a ochrana dat", description: "Zpracování v souladu s EU nařízením. Vaše data neprodáváme." },
      { title: "Zrušení kdykoli", description: "Předplatné spravujete v účtu. Redakce se platí hned; u OrdiZapisu a lékaře po 14 dnech. Bez skrytých poplatků." },
    ],
    privacy: "Zásady ochrany osobních údajů",
    terms: "Obchodní podmínky",
    noAccountTitle: "Ještě nemáte účet?",
    noAccountLead: "Zaregistrujte se zdarma, poté se vraťte sem a vyberte tarif. Redakce se účtuje ihned; OrdiZapis a lékař mají 14 dní.",
    createAccount: "Vytvořit účet zdarma",
    b2bNote: "B2B nabídka pro firmy na",
    contact: "kontakt",
    plans: {
      public: {
        name: "Redakce",
        features: [
          "Aktuální zdravotní texty české i zahraniční redakce",
          "Články o dlouhověkosti, spánku, pohybu a stravě",
          "MeDipacient — zprávy v telefonu",
          "AI asistent pro veřejnost",
          "Bez reklam v článcích",
        ],
      },
      student: {
        name: "Student LF",
        features: [
          "MeDiprep: testy B/C/F a simulace 8 českých LF",
          "Celá Academy včetně přípravných kurzů na přijímačky",
          "AI tutor a studijní materiály",
          "Kvízy, hry a modelové otázky",
          "1 test zdarma · první měsíc 89 Kč · další měsíce 149 Kč, zrušíte kdykoli",
          "149 Kč = Student LF (Academy) — magazín otevírá tarif Redakce nebo vyšší plán",
        ],
      },
      dokumentace: {
        name: "OrdiZapis",
        features: [
          "OrdiZapis: nahrávání v mobilu — diktát i konzultace → zápis",
          "Šablony: ambulantní, SOAP, anamnéza…",
          "Historie zápisů v účtu — sync mobil ↔ web",
          "Základní odborné přehledy v aplikaci",
          "14 dní zdarma — jen tento tarif OrdiZapis",
        ],
        extraNote: "Stejná práva lékaře jako tarif 490 Kč — levnější vstup s AI zápisy.",
      },
      physician: {
        name: "Lékař v praxi",
        features: [
          "Vše z OrdiZapisu (AI zápisy) v ceně",
          "Odborná sekce, guidelines a Research Hub",
          "CME přehledy a souhrny studií",
          "Klinický AI asistent",
          "Navíc oproti OrdiZapis 390 Kč: CME + Research Hub + prioritní notifikace",
        ],
      },
    },
    comparisonRows: [
      "Magazínové články bez reklam",
      "AI asistent pro veřejnost",
      "Prevence a životní styl",
      "Kvízy a studijní plány",
      "AI tutor pro studenty LF",
      "Modelové otázky na přijímačky",
      "Odborná sekce a guidelines",
      "CME přehledy a souhrny studií",
      "Klinický AI asistent",
      "OrdiZapis (AI zápisy) — i standalone za 390 Kč",
      "Research Hub a diagnostické algoritmy",
      "MedScope Academy (základní kurzy)",
      "Prioritní notifikace novinek",
    ],
    audienceByApp: {
      medipacient: "Pacienti a rodiny",
      mediprep: "Uchazeči o medicínu",
      ordizapis: "Lékaři a ambulance",
      mediflow: "Veřejnost a longevity",
    },
    priceNoteByApp: {
      medipacient: "s tarifem Redakce, potom",
      mediprep: "1 test zdarma, první měsíc 89 Kč, potom 149 Kč",
      ordizapis: "14 dní zdarma, potom",
      mediflow: "s tarifem Redakce",
    },
  },
  en: {
    metaTitle: "Subscription | ViaLongeVita",
    metaDescription:
      "Longevity articles open with a preview. Editorial plan 25 CZK / €1 / $1 or 250 CZK / €10 a year, billed now. OrdiZapis and physician: 14 days. Student: 1 free test, intro month, then 149 CZK / €10. Cancel anytime. Card payment via Stripe.",
    eyebrow: "Subscription",
    title: "Longevity in plain language — Editorial plan",
    lead: "The opening is free. Editorial opens the rest — monthly, or yearly with two months included. OrdiZapis and physician: 14 days free. Student: 1 free test, intro month, then 149 CZK / €10. Cancel anytime.",
    trialFromCta: "You came from a trial CTA — the highlighted plan below is",
    studentPlan: "Medical student",
    trialFromCtaRest: "(admissions prep and study). Parents: create the account in the student’s name.",
    parentsTip: "Note for parents and applicants",
    parentsBodyBefore: "The Medical student plan opens Academy, the AI tutor and quizzes. First try the",
    selfTest: "self-test",
    parentsBodyMid: "and one free test — then a plan makes sense.",
    parentsMore: "More for parents",
    openApp: "Open →",
    downloadApp: "Install on mobile",
    choosePlan: "Choose a plan",
    choosePlanLead: "Editorial: monthly or yearly, the text opens now. OrdiZapis and physician: 14-day trial. Student LF: 1 free test, intro month, then 149 CZK / €10. Cancel anytime. Checkout opens Stripe.",
    bestForClinic: "Best value for the clinic",
    mostPopular: "Most popular",
    daysFree: "14 days free",
    editorialBadge: "Full text now",
    bannerKicker: "ViaLongeVita Editorial",
    bannerTitle: "The rest of the article is yours now — just {price}",
    bannerLead: "Just {price} a month. The yearly plan includes two months. The text opens as soon as you pay — cancel anytime.",
    bannerPayCta: "Pay {price} and read",
    bannerPayBusy: "Opening payment…",
    billedNow: "Opens immediately",
    startEditorialMonth: "Read for a month",
    startEditorialYear: "Read for a year",
    studentBadge: "1 free test · intro month",
    firstMonth: "first month",
    thenMonthly: "then",
    startStudentMonth: "Start the intro month",
    afterStudentIntro: "Then",
    perMonth: "/ month",
    yearly: "Yearly:",
    perYear: "/ year",
    twoMonthsFree: "(≈ 2 months free)",
    startTrialMonth: "Start the 14-day trial — monthly",
    startTrialYear: "Start the trial — yearly",
    startOrdiZapis: "Start 14 days free — 390 CZK",
    afterTrial: "After 14 days",
    afterTrialUnit: "CZK/month",
    currencyLabel: "CZK",
    cancelAnytime: "cancel anytime",
    supportTitle: "No plan yet — keep the preview",
    supportLead:
      "The opening stays readable. The rest opens with the Editorial plan — billed now at 25 CZK / €1 / $1 a month, or 250 CZK / €10 a year. Tips stay voluntary.",
    supportCta: "Open longevity articles",
    keepReading: "Read the preview",
    comparisonTitle: "Compare plans",
    comparisonLead:
      "Features by audience. Editorial: billed now. OrdiZapis and Physician: 14-day trial. Student: 1 free test, intro month, then 149 CZK / €10. OrdiZapis (390 CZK) is the documentation app; Physician (490 CZK) adds CME, Research Hub and clinical AI.",
    featureCol: "Feature",
    included: "Included",
    notIncluded: "Not included",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "How does the 14-day trial work?",
        a: "OrdiZapis and physician: after you enter a card via Stripe, the first 14 days are not billed. Editorial is billed immediately — monthly or yearly. Student LF has no 14-day trial — 1 free test, an intro month, then 149 CZK / €10. Cancel anytime before the next charge.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Cancel in Account or the Stripe customer portal. Access stays active until the end of the paid period.",
      },
      {
        q: "Which plan should I choose?",
        a: "Editorial (25 CZK / €1 / $1) — current health desk, prevention and public AI. Medical student (intro month, then 149 CZK / €10) — study materials, quizzes and AI tutor. Physician (490 CZK) — professional desk, guidelines, CME and clinical AI.",
      },
      {
        q: "Can a parent buy a plan for a child?",
        a: "Yes. On /studenti/darkove you buy Student LF (intro month, then 149 CZK / €10) and forward the activation link. The student opens it on their account. A subscription does not guarantee admission to medical school.",
      },
      {
        q: "Which payment methods do you accept?",
        a: "Stripe handles payments: Visa, Mastercard, Apple Pay and Google Pay. We do not store card numbers on our servers.",
      },
      {
        q: "Is the yearly plan better value?",
        a: "Yes — yearly billing equals 10 months of the monthly price (≈ 2 months free). Example: Medical student 1,490 CZK/year instead of 1,788 CZK monthly.",
      },
      {
        q: "Do I need an account before paying?",
        a: "Register first, then pick a plan here. Physician plans may require professional verification (ČLK).",
      },
    ],
    trustTitle: "Secure payment and privacy",
    trustAria: "Payment trust",
    trust: [
      { title: "Payments via Stripe", description: "Card, Apple Pay and Google Pay. PCI-compliant checkout." },
      { title: "GDPR and data protection", description: "Processed under EU rules. We do not sell your data." },
      { title: "Cancel anytime", description: "Manage the subscription in your account. Editorial is billed now; OrdiZapis and physician after 14 days. No hidden fees." },
    ],
    privacy: "Privacy policy",
    terms: "Terms",
    noAccountTitle: "No account yet?",
    noAccountLead: "Create a free account, then come back here and pick a plan. Editorial is billed now; OrdiZapis and physician have 14 days.",
    createAccount: "Create a free account",
    b2bNote: "B2B offer for organisations at",
    contact: "contact",
    plans: {
      public: {
        name: "Editorial",
        features: [
          "Current health desk in your edition language",
          "Articles on longevity, sleep, movement and food",
          "MeDipacient — reports on your phone",
          "Public AI assistant",
          "Ad-free articles",
        ],
      },
      student: {
        name: "Medical student",
        features: [
          "MeDiprep: B/C/F tests and 8 Czech faculty mocks",
          "Full Academy including admissions prep",
          "AI tutor and study materials",
          "Quizzes, games and model questions",
          "1 free test · intro month · then 149 CZK / €10 — cancel anytime",
          "149 CZK = Academy student — the magazine opens with Editorial or a higher plan",
        ],
      },
      dokumentace: {
        name: "OrdiZapis",
        features: [
          "OrdiZapis: record on mobile — dictation or consult → note",
          "Templates: outpatient, SOAP, history…",
          "Note history in your account — phone ↔ web sync",
          "Core professional briefs in the app",
          "14 days free — this OrdiZapis plan only",
        ],
        extraNote: "Same physician rights as the 490 CZK plan — a cheaper entry with AI notes.",
      },
      physician: {
        name: "Practicing physician",
        features: [
          "Everything in OrdiZapis (AI notes) included",
          "Professional desk, guidelines and Research Hub",
          "CME briefs and study summaries",
          "Clinical AI assistant",
          "Vs OrdiZapis 390 CZK: CME + Research Hub + priority alerts",
        ],
      },
    },
    comparisonRows: [
      "Magazine articles without ads",
      "Public AI assistant",
      "Prevention and lifestyle",
      "Quizzes and study plans",
      "AI tutor for medical students",
      "Admissions model questions",
      "Professional desk and guidelines",
      "CME briefs and study summaries",
      "Clinical AI assistant",
      "OrdiZapis (AI notes) — also standalone at 390 CZK",
      "Research Hub and diagnostic algorithms",
      "MedScope Academy (core courses)",
      "Priority news alerts",
    ],
    audienceByApp: {
      medipacient: "Patients and families",
      mediprep: "Medicine applicants",
      ordizapis: "Physicians and clinics",
      mediflow: "Public and longevity",
    },
    priceNoteByApp: {
      medipacient: "with the Editorial plan, then",
      mediprep: "1 free test, intro month, then 149 CZK / €10",
      ordizapis: "14 days free, then",
      mediflow: "with the Editorial plan",
    },
  },
  de: {
    metaTitle: "Abo | ViaLongeVita",
    metaDescription:
      "Langlebigkeitsartikel beginnen mit einer Vorschau. Redaktion 1 € oder 10 €/Jahr, sofort. OrdiZapis und Arzt: 14 Tage. Studium: 1 Test frei, Einstiegsmonat 6 €, danach 10 €. Jederzeit kündbar. Zahlung per Stripe.",
    eyebrow: "Abo",
    title: "Langlebigkeit verständlich — Redaktionsabo",
    lead: "Der Artikelanfang bleibt frei. Das Redaktionsabo öffnet den Rest — monatlich, oder jährlich mit zwei Monaten im Preis. OrdiZapis und Arzt: 14 Tage kostenlos. Medizinstudium: 1 Test frei, Einstiegsmonat 6 €, danach 10 €. Jederzeit kündbar.",
    trialFromCta: "Sie kommen vom Test-CTA — hervorgehoben ist der Tarif",
    studentPlan: "Medizinstudium",
    trialFromCtaRest: "(Aufnahmeprüfung und Studium). Eltern: Konto auf den Namen der oder des Studierenden anlegen.",
    parentsTip: "Hinweis für Eltern und Bewerber",
    parentsBodyBefore: "Der Tarif Medizinstudium öffnet Academy, KI-Tutor und Quiz. Zuerst den",
    selfTest: "Selbsttest",
    parentsBodyMid: "und einen freien Test — dann lohnt sich das Abo.",
    parentsMore: "Mehr für Eltern",
    openApp: "Öffnen →",
    downloadApp: "Aufs Handy laden",
    choosePlan: "Tarif wählen",
    choosePlanLead: "Redaktion: monatlich oder jährlich, der Text ist sofort da. OrdiZapis und Arzt: 14 Tage kostenlos. Medizinstudium: 1 Test frei, erster Monat 6 €, danach 10 €. Jederzeit kündbar. Die Kasse öffnet Stripe.",
    bestForClinic: "Bestes Preis-Leistungs-Verhältnis für die Praxis",
    mostPopular: "Beliebtester Tarif",
    daysFree: "14 Tage kostenlos",
    editorialBadge: "Sofort lesbar",
    bannerKicker: "ViaLongeVita Redaktion",
    bannerTitle: "Den Rest des Artikels haben Sie sofort — nur {price}",
    bannerLead:
      "Nur {price} im Monat. Im Jahresabo stecken zwei Monate. Der Text öffnet sich nach der Karte — jederzeit kündbar.",
    bannerPayCta: "Für {price} lesen",
    bannerPayBusy: "Zahlung wird geöffnet…",
    billedNow: "Sofort zugänglich",
    startEditorialMonth: "Einen Monat lesen",
    startEditorialYear: "Ein Jahr lesen",
    studentBadge: "1 Test frei · 6 €",
    firstMonth: "erster Monat",
    thenMonthly: "dann",
    startStudentMonth: "Einstiegsmonat starten — 6 €",
    afterStudentIntro: "Danach",
    perMonth: "/ Monat",
    yearly: "Jährlich:",
    perYear: "/ Jahr",
    twoMonthsFree: "(≈ 2 Monate gratis)",
    startTrialMonth: "14-Tage-Test starten — monatlich",
    startTrialYear: "Test starten — jährlich",
    startOrdiZapis: "14 Tage kostenlos starten — 390 CZK",
    afterTrial: "Nach 14 Tagen",
    afterTrialUnit: "CZK/Monat",
    currencyLabel: "CZK",
    cancelAnytime: "jederzeit kündbar",
    supportTitle: "Noch kein Abo — Vorschau weiterlesen",
    supportLead:
      "Der Artikelanfang bleibt lesbar. Den Rest öffnet das Redaktionsabo — 1 € im Monat oder 10 € im Jahr, sofort. Ein Tipp am Artikel bleibt freiwillig.",
    supportCta: "Artikel zur Langlebigkeit öffnen",
    keepReading: "Vorschau lesen",
    comparisonTitle: "Tarifvergleich",
    comparisonLead:
      "Funktionen nach Zielgruppe. Redaktion: sofort. OrdiZapis und Arzt: 14 Tage Test. Medizinstudium: 1 Test frei, 6 €, danach 10 €. OrdiZapis (390 CZK) ist die Dokumentations-App; Arzt in der Praxis (490 CZK) ergänzt CME, Research Hub und klinische KI.",
    featureCol: "Funktion",
    included: "Enthalten",
    notIncluded: "Nicht enthalten",
    faqTitle: "Häufige Fragen",
    faq: [
      {
        q: "Wie funktioniert die 14-tägige Testphase?",
        a: "OrdiZapis und Arzt: nach Karteneingabe bei Stripe sind die ersten 14 Tage unentgeltlich. Die Redaktion wird sofort berechnet — monatlich oder jährlich. Medizinstudium hat keinen 14-Tage-Test — 1 Test frei, Einstiegsmonat 6 €, danach 10 €. Kündigung vor der nächsten Abbuchung.",
      },
      {
        q: "Kann ich jederzeit kündigen?",
        a: "Ja. Kündigung im Konto oder im Stripe-Kundenportal. Der Zugang bleibt bis zum Ende des bezahlten Zeitraums aktiv.",
      },
      {
        q: "Welchen Tarif soll ich wählen?",
        a: "Redaktion (25 CZK / 1 € / 1 $) — aktuelle Gesundheitstexte, Prävention und öffentliche KI. Medizinstudium (6 €, danach 10 €) — Lernmaterial, Quiz und KI-Tutor. Arzt in der Praxis (490 CZK) — Fachredaktion, Leitlinien, CME und klinische KI.",
      },
      {
        q: "Kann ein Elternteil das Abo für ein Kind kaufen?",
        a: "Ja. Unter /studenti/darkove kaufen Sie Medizinstudium (6 €, danach 10 €) und leiten den Aktivierungslink weiter. Die Studentin öffnet ihn auf ihrem Konto. Das Abo garantiert keine Zulassung.",
      },
      {
        q: "Welche Zahlungsarten akzeptieren Sie?",
        a: "Stripe: Visa, Mastercard, Apple Pay und Google Pay. Kartendaten speichern wir nicht auf unseren Servern.",
      },
      {
        q: "Ist der Jahrestarif günstiger?",
        a: "Ja — das Jahresabo entspricht 10 Monatspreisen (≈ 2 Monate gratis). Beispiel Medizinstudium: 1.490 CZK/Jahr statt 1.788 CZK monatlich.",
      },
      {
        q: "Brauche ich vor der Zahlung ein Konto?",
        a: "Bitte zuerst registrieren, dann hier den Tarif wählen. Beim Arzttarif kann eine berufliche Prüfung (ČLK) nötig sein.",
      },
    ],
    trustTitle: "Sichere Zahlung und Datenschutz",
    trustAria: "Zahlungsvertrauen",
    trust: [
      { title: "Zahlung über Stripe", description: "Karte, Apple Pay und Google Pay. PCI-konform." },
      { title: "DSGVO und Datenschutz", description: "Verarbeitung nach EU-Recht. Wir verkaufen Ihre Daten nicht." },
      { title: "Jederzeit kündbar", description: "Abo im Konto verwalten. Redaktion sofort; OrdiZapis und Arzt nach 14 Tagen. Keine versteckten Gebühren." },
    ],
    privacy: "Datenschutz",
    terms: "AGB",
    noAccountTitle: "Noch kein Konto?",
    noAccountLead: "Kostenlos registrieren, dann hier den Tarif wählen. Redaktion wird sofort berechnet; OrdiZapis und Arzt haben 14 Tage.",
    createAccount: "Kostenloses Konto anlegen",
    b2bNote: "B2B-Angebot für Unternehmen unter",
    contact: "Kontakt",
    plans: {
      public: {
        name: "Redaktion",
        features: [
          "Aktuelle Gesundheitstexte der lokalen Redaktion",
          "Artikel zu Langlebigkeit, Schlaf, Bewegung und Ernährung",
          "MeDipacient — Berichte am Handy",
          "KI-Assistent für alle",
          "Artikel ohne Werbung",
        ],
      },
      student: {
        name: "Medizinstudium",
        features: [
          "MeDiprep: B/C/F-Tests und 8 tschechische Fakultäts-Simulationen",
          "Gesamte Academy inkl. Aufnahmevorbereitung",
          "KI-Tutor und Lernmaterial",
          "Quiz, Spiele und Modellfragen",
          "1 Test frei · Einstiegsmonat 6 € · danach 10 € — jederzeit kündbar",
          "10 € = Academy-Student — das Magazin öffnet das Redaktionsabo oder ein höherer Tarif",
        ],
      },
      dokumentace: {
        name: "OrdiZapis",
        features: [
          "OrdiZapis: am Handy aufnehmen — Diktat oder Gespräch → Notiz",
          "Vorlagen: ambulant, SOAP, Anamnese…",
          "Notizhistorie im Konto — Sync Handy ↔ Web",
          "Fachliche Kurzüberblicke in der App",
          "14 Tage kostenlos — nur dieser OrdiZapis-Tarif",
        ],
        extraNote: "Gleiche Arztrechte wie der 490-CZK-Tarif — günstigerer Einstieg mit KI-Notizen.",
      },
      physician: {
        name: "Arzt in der Praxis",
        features: [
          "Alles aus OrdiZapis (KI-Notizen) inklusive",
          "Fachredaktion, Leitlinien und Research Hub",
          "CME-Überblicke und Studienkurzfassungen",
          "Klinischer KI-Assistent",
          "Gegenüber OrdiZapis 390 CZK: CME + Research Hub + Prioritätsalarme",
        ],
      },
    },
    comparisonRows: [
      "Magazinartikel ohne Werbung",
      "KI-Assistent für die Öffentlichkeit",
      "Prävention und Lebensstil",
      "Quiz und Lernpläne",
      "KI-Tutor für Medizinstudierende",
      "Modellfragen zur Aufnahmeprüfung",
      "Fachredaktion und Leitlinien",
      "CME-Überblicke und Studienkurzfassungen",
      "Klinischer KI-Assistent",
      "OrdiZapis (KI-Notizen) — auch standalone für 390 CZK",
      "Research Hub und Diagnosealgorithmen",
      "MedScope Academy (Grundkurse)",
      "Prioritäre Neuigkeiten",
    ],
    audienceByApp: {
      medipacient: "Patienten und Familien",
      mediprep: "Medizinstudienbewerber",
      ordizapis: "Ärzte und Praxen",
      mediflow: "Öffentlichkeit und Langlebigkeit",
    },
    priceNoteByApp: {
      medipacient: "mit dem Redaktionsabo, dann",
      mediprep: "1 Test frei, Einstiegsmonat 6 €, danach 10 €",
      ordizapis: "14 Tage kostenlos, dann",
      mediflow: "mit dem Redaktionsabo",
    },
  },
  fr: {
    metaTitle: "Abonnement | ViaLongeVita",
    metaDescription:
      "Les articles longévité s’ouvrent par un aperçu. Rédaction 1 € ou 10 €/an, paiement immédiat. OrdiZapis et médecin : 14 jours. Étudiant : 1 test offert, premier mois 6 €, puis 10 €. Résiliation à tout moment. Paiement par carte via Stripe.",
    eyebrow: "Abonnement",
    title: "La longévité en clair — abonnement Rédaction",
    lead: "L’ouverture reste gratuite. La Rédaction ouvre le reste — au mois, ou à l’année avec deux mois inclus. OrdiZapis et médecin : 14 jours gratuits. Étudiant : 1 test offert, premier mois 6 €, puis 10 €. Résiliation à tout moment.",
    trialFromCta: "Vous arrivez depuis un CTA d’essai — la formule mise en avant est",
    studentPlan: "Étudiant en médecine",
    trialFromCtaRest: "(préparation aux concours et études). Parents : créez le compte au nom de l’étudiant.",
    parentsTip: "Note pour les parents et candidats",
    parentsBodyBefore: "La formule Étudiant en médecine ouvre l’Academy, le tuteur IA et les quiz. Essayez d’abord le",
    selfTest: "auto-test",
    parentsBodyMid: "et un test offert — l’abonnement a alors du sens.",
    parentsMore: "Plus pour les parents",
    openApp: "Ouvrir →",
    downloadApp: "Installer sur mobile",
    choosePlan: "Choisir une formule",
    choosePlanLead: "Rédaction : au mois ou à l’année, le texte s’ouvre tout de suite. OrdiZapis et médecin : 14 jours gratuits. Étudiant : 1 test offert, premier mois 6 €, puis 10 €. Résiliation à tout moment. Le paiement s’ouvre sur Stripe.",
    bestForClinic: "Meilleur rapport pour le cabinet",
    mostPopular: "La plus populaire",
    daysFree: "14 jours gratuits",
    editorialBadge: "Texte complet tout de suite",
    bannerKicker: "Rédaction ViaLongeVita",
    bannerTitle: "Le reste de l’article est à vous tout de suite — seulement {price}",
    bannerLead:
      "Seulement {price} par mois. L’annuel inclut deux mois. Le texte s’ouvre dès le paiement — résiliable à tout moment.",
    bannerPayCta: "Payer {price} et lire",
    bannerPayBusy: "Ouverture du paiement…",
    billedNow: "S’ouvre tout de suite",
    startEditorialMonth: "Lire un mois",
    startEditorialYear: "Lire toute l’année",
    studentBadge: "1 test offert · 6 €",
    firstMonth: "premier mois",
    thenMonthly: "puis",
    startStudentMonth: "Démarrer le mois d’intro — 6 €",
    afterStudentIntro: "Ensuite",
    perMonth: "/ mois",
    yearly: "Annuel :",
    perYear: "/ an",
    twoMonthsFree: "(≈ 2 mois offerts)",
    startTrialMonth: "Démarrer l’essai 14 jours — mensuel",
    startTrialYear: "Démarrer l’essai — annuel",
    startOrdiZapis: "Démarrer 14 jours gratuits — 390 CZK",
    afterTrial: "Après 14 jours",
    afterTrialUnit: "CZK/mois",
    currencyLabel: "CZK",
    cancelAnytime: "résiliation à tout moment",
    supportTitle: "Pas d’abonnement ? Lisez l’aperçu",
    supportLead:
      "Le début de l’article reste lisible. Le reste s’ouvre avec l’abonnement Rédaction — 1 € par mois ou 10 € par an, tout de suite. Le pourboire reste volontaire.",
    supportCta: "Ouvrir les articles sur la longévité",
    keepReading: "Lire l’aperçu",
    comparisonTitle: "Comparer les formules",
    comparisonLead:
      "Fonctions par public. Rédaction : paiement immédiat. OrdiZapis et Médecin : 14 jours d’essai. Étudiant : 1 test offert, 6 €, puis 10 €. OrdiZapis (390 CZK) est l’appli de notes ; Médecin en exercice (490 CZK) ajoute FMC, Research Hub et IA clinique.",
    featureCol: "Fonction",
    included: "Inclus",
    notIncluded: "Non inclus",
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Comment fonctionne l’essai de 14 jours ?",
        a: "OrdiZapis et médecin : après saisie de carte via Stripe, les 14 premiers jours ne sont pas facturés. La rédaction est facturée tout de suite — au mois ou à l’année. L’étudiant n’a pas d’essai 14 jours — 1 test offert, premier mois 6 €, puis 10 €. Résiliation avant le prochain prélèvement.",
      },
      {
        q: "Puis-je résilier à tout moment ?",
        a: "Oui. Résiliation dans Compte ou le portail client Stripe. L’accès reste actif jusqu’à la fin de la période payée.",
      },
      {
        q: "Quelle formule choisir ?",
        a: "Rédaction (25 CZK / 1 € / 1 $) — textes santé du desk, prévention et IA grand public. Étudiant (6 €, puis 10 €) — supports, quiz et tuteur IA. Médecin (490 CZK) — bureau professionnel, guidelines, FMC et IA clinique.",
      },
      {
        q: "Un parent peut-il acheter pour un enfant ?",
        a: "Oui. Sur /studenti/darkove vous achetez Étudiant (6 €, puis 10 €) et transmettez le lien d’activation. L’étudiant l’ouvre sur son compte. L’abonnement ne garantit pas l’admission.",
      },
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Stripe : Visa, Mastercard, Apple Pay et Google Pay. Nous ne stockons pas les numéros de carte.",
      },
      {
        q: "La formule annuelle est-elle plus avantageuse ?",
        a: "Oui — l’annuel équivaut à 10 mois (≈ 2 mois offerts). Ex. étudiant : 1 490 CZK/an au lieu de 1 788 CZK en mensuel.",
      },
      {
        q: "Faut-il un compte avant de payer ?",
        a: "Inscrivez-vous d’abord, puis choisissez la formule ici. Les formules médecins peuvent exiger une vérification professionnelle (ČLK).",
      },
    ],
    trustTitle: "Paiement sécurisé et confidentialité",
    trustAria: "Confiance paiement",
    trust: [
      { title: "Paiement via Stripe", description: "Carte, Apple Pay et Google Pay. Conforme PCI." },
      { title: "RGPD et protection des données", description: "Traitement selon le droit de l’UE. Nous ne vendons pas vos données." },
      { title: "Résiliation à tout moment", description: "Gérez l’abonnement dans le compte. Rédaction tout de suite ; OrdiZapis et médecin après 14 jours. Pas de frais cachés." },
    ],
    privacy: "Politique de confidentialité",
    terms: "Conditions",
    noAccountTitle: "Pas encore de compte ?",
    noAccountLead: "Créez un compte gratuit, puis revenez ici et choisissez une formule. La rédaction est facturée tout de suite ; OrdiZapis et médecin ont 14 jours.",
    createAccount: "Créer un compte gratuit",
    b2bNote: "Offre B2B pour les organisations sur",
    contact: "contact",
    plans: {
      public: {
        name: "Rédaction",
        features: [
          "Textes santé du desk dans la langue de l’édition",
          "Articles sur la longévité, le sommeil, le mouvement et l’alimentation",
          "MeDipacient — comptes rendus sur mobile",
          "Assistant IA grand public",
          "Articles sans publicité",
        ],
      },
      student: {
        name: "Étudiant en médecine",
        features: [
          "MeDiprep : tests B/C/F et 8 simulations de facultés tchèques",
          "Toute l’Academy y compris la prépa concours",
          "Tuteur IA et supports d’étude",
          "Quiz, jeux et questions types",
          "1 test offert · premier mois 6 € · puis 10 € — résiliation à tout moment",
          "10 € = étudiant Academy — le magazine s’ouvre avec la Rédaction ou une formule supérieure",
        ],
      },
      dokumentace: {
        name: "OrdiZapis",
        features: [
          "OrdiZapis : enregistrez sur mobile — dictée ou consult → note",
          "Modèles : ambulatoire, SOAP, anamnèse…",
          "Historique des notes — sync mobile ↔ web",
          "Brèves professionnelles dans l’appli",
          "14 jours gratuits — cette formule OrdiZapis uniquement",
        ],
        extraNote: "Mêmes droits médecin que la formule 490 CZK — entrée moins chère avec notes IA.",
      },
      physician: {
        name: "Médecin en exercice",
        features: [
          "Tout OrdiZapis (notes IA) inclus",
          "Bureau professionnel, guidelines et Research Hub",
          "Brèves FMC et synthèses d’études",
          "Assistant IA clinique",
          "Vs OrdiZapis 390 CZK : FMC + Research Hub + alertes prioritaires",
        ],
      },
    },
    comparisonRows: [
      "Articles du magazine sans publicité",
      "Assistant IA grand public",
      "Prévention et mode de vie",
      "Quiz et plans d’étude",
      "Tuteur IA pour étudiants en médecine",
      "Questions types d’admission",
      "Bureau professionnel et guidelines",
      "Brèves FMC et synthèses d’études",
      "Assistant IA clinique",
      "OrdiZapis (notes IA) — aussi en standalone à 390 CZK",
      "Research Hub et algorithmes diagnostiques",
      "MedScope Academy (cours de base)",
      "Alertes d’actualité prioritaires",
    ],
    audienceByApp: {
      medipacient: "Patients et familles",
      mediprep: "Candidats en médecine",
      ordizapis: "Médecins et cabinets",
      mediflow: "Grand public et longévité",
    },
    priceNoteByApp: {
      medipacient: "avec l’abonnement Rédaction, puis",
      mediprep: "1 test offert, premier mois 6 €, puis 10 €",
      ordizapis: "14 jours gratuits, puis",
      mediflow: "avec l’abonnement Rédaction",
    },
  },
};

type BannerOverlay = Pick<
  SubscribeCopy,
  | "bannerKicker"
  | "bannerTitle"
  | "bannerLead"
  | "bannerPayCta"
  | "bannerPayBusy"
  | "billedNow"
  | "cancelAnytime"
>;

/** Banner-only packs so editions without a full subscribe file still pay in their language. */
export function subscribeBannerPack(locale?: string | null): string {
  const normalized = normalizeLocale(locale ?? "cs");
  if (normalized === "zh-CN" || normalized === "cn") return "zh-CN";
  if (normalized === "pt-BR" || normalized === "pt") return "pt-BR";
  if (normalized === "en-US" || normalized === "en-UK" || normalized === "en") return "en";
  const primary = primaryArticleLocale(normalized);
  if (primary === "zh") return "zh-CN";
  if (primary === "en") return "en";
  return primary;
}

const BANNER_OVERLAY: Record<string, BannerOverlay> = {
  sk: {
    bannerKicker: "Redakcia ViaLongeVita",
    bannerTitle: "Zvyšok článku máte hneď — len za {price}",
    bannerLead:
      "Mesačne len {price}. Ročný prístup má dva mesiace v cene. Kartou sa text otvorí teraz — zrušíte kedykoľvek.",
    bannerPayCta: "Zaplatiť {price} a čítať",
    bannerPayBusy: "Otváram platbu…",
    billedNow: "Otvorí sa hneď",
    cancelAnytime: "zrušenie kedykoľvek",
  },
  pl: {
    bannerKicker: "Redakcja ViaLongeVita",
    bannerTitle: "Resztę artykułu masz od razu — tylko {price}",
    bannerLead:
      "Miesięcznie tylko {price}. Roczny dostęp zawiera dwa miesiące. Po płatności kartą tekst otworzy się od razu — rezygnacja w każdej chwili.",
    bannerPayCta: "Zapłać {price} i czytaj",
    bannerPayBusy: "Otwieram płatność…",
    billedNow: "Otwiera się od razu",
    cancelAnytime: "rezygnacja w każdej chwili",
  },
  it: {
    bannerKicker: "Redazione ViaLongeVita",
    bannerTitle: "Il resto dell’articolo è suo subito — solo {price}",
    bannerLead:
      "Solo {price} al mese. L’abbonamento annuale include due mesi. Il testo si apre appena paga — disdetta quando vuole.",
    bannerPayCta: "Paga {price} e leggi",
    bannerPayBusy: "Apertura del pagamento…",
    billedNow: "Si apre subito",
    cancelAnytime: "disdetta in qualsiasi momento",
  },
  es: {
    bannerKicker: "Redacción ViaLongeVita",
    bannerTitle: "El resto del artículo es suyo ahora — solo {price}",
    bannerLead:
      "Solo {price} al mes. El plan anual incluye dos meses. El texto se abre al pagar — cancele cuando quiera.",
    bannerPayCta: "Pagar {price} y leer",
    bannerPayBusy: "Abriendo el pago…",
    billedNow: "Se abre al instante",
    cancelAnytime: "cancele cuando quiera",
  },
  "pt-BR": {
    bannerKicker: "Redação ViaLongeVita",
    bannerTitle: "O resto do artigo é seu agora — só {price}",
    bannerLead:
      "Só {price} por mês. O plano anual inclui dois meses. O texto abre assim que pagar — cancele quando quiser.",
    bannerPayCta: "Pagar {price} e ler",
    bannerPayBusy: "Abrindo o pagamento…",
    billedNow: "Abre imediatamente",
    cancelAnytime: "cancele quando quiser",
  },
  ro: {
    bannerKicker: "Redacția ViaLongeVita",
    bannerTitle: "Restul articolului îl aveți imediat — doar {price}",
    bannerLead:
      "Lunar doar {price}. Planul anual include două luni. Textul se deschide imediat după plată — anulați oricând.",
    bannerPayCta: "Plătiți {price} și citiți",
    bannerPayBusy: "Deschid plata…",
    billedNow: "Se deschide imediat",
    cancelAnytime: "anulare oricând",
  },
  hu: {
    bannerKicker: "ViaLongeVita szerkesztőség",
    bannerTitle: "A cikk többi része azonnal az Öné — csak {price}",
    bannerLead:
      "Havonta csak {price}. Az éves csomagban két hónap benne van. A szöveg a fizetés után azonnal megnyílik — bármikor lemondható.",
    bannerPayCta: "Fizessen {price} és olvasson",
    bannerPayBusy: "Fizetés megnyitása…",
    billedNow: "Azonnal megnyílik",
    cancelAnytime: "bármikor lemondható",
  },
  ru: {
    bannerKicker: "Редакция ViaLongeVita",
    bannerTitle: "Остальной текст статьи сразу ваш — всего {price}",
    bannerLead:
      "Всего {price} в месяц. В годовой подписке два месяца в цене. Текст откроется сразу после оплаты — отмена в любой момент.",
    bannerPayCta: "Оплатить {price} и читать",
    bannerPayBusy: "Открываю оплату…",
    billedNow: "Откроется сразу",
    cancelAnytime: "отмена в любой момент",
  },
  uk: {
    bannerKicker: "Редакція ViaLongeVita",
    bannerTitle: "Решта статті ваша одразу — лише {price}",
    bannerLead:
      "Лише {price} на місяць. Річний доступ містить два місяці. Текст відкриється одразу після оплати — скасувати можна будь-коли.",
    bannerPayCta: "Сплатити {price} і читати",
    bannerPayBusy: "Відкриваю оплату…",
    billedNow: "Відкриється одразу",
    cancelAnytime: "скасування будь-коли",
  },
  be: {
    bannerKicker: "Рэдакцыя ViaLongeVita",
    bannerTitle: "Астатак артыкула ваш адразу — толькі {price}",
    bannerLead:
      "Толькі {price} у месяц. Гадавы доступ мае два месяцы ў цане. Тэкст адкрыецца адразу пасля аплаты — скасаваць можна ў любы час.",
    bannerPayCta: "Аплаціць {price} і чытаць",
    bannerPayBusy: "Адкрываю аплату…",
    billedNow: "Адкрыецца адразу",
    cancelAnytime: "скасаванне ў любы час",
  },
  "zh-CN": {
    bannerKicker: "ViaLongeVita 编辑部",
    bannerTitle: "文章全文现在就读 — 仅 {price}",
    bannerLead: "每月仅 {price}。年付含两个月。付款后立即打开全文，可随时取消。",
    bannerPayCta: "支付 {price} 并阅读",
    bannerPayBusy: "正在打开支付…",
    billedNow: "立即开通",
    cancelAnytime: "随时可取消",
  },
  ja: {
    bannerKicker: "ViaLongeVita 編集部",
    bannerTitle: "記事の続きは今すぐ — わずか {price}",
    bannerLead:
      "月額わずか {price}。年額には2か月分が含まれます。支払うと本文が開きます。いつでも解約できます。",
    bannerPayCta: "{price} で読む",
    bannerPayBusy: "決済を開いています…",
    billedNow: "すぐに開きます",
    cancelAnytime: "いつでも解約可",
  },
  ko: {
    bannerKicker: "ViaLongeVita 편집부",
    bannerTitle: "기사 나머지는 바로 — 단 {price}",
    bannerLead:
      "월 {price}. 연간 요금제에 두 달이 포함됩니다. 결제하면 본문이 열립니다. 언제든 해지할 수 있습니다.",
    bannerPayCta: "{price} 결제하고 읽기",
    bannerPayBusy: "결제를 여는 중…",
    billedNow: "바로 열립니다",
    cancelAnytime: "언제든 해지",
  },
  vi: {
    bannerKicker: "Tòa soạn ViaLongeVita",
    bannerTitle: "Phần còn lại của bài viết là của bạn ngay — chỉ {price}",
    bannerLead:
      "Chỉ {price} mỗi tháng. Gói năm gồm hai tháng. Văn bản mở ngay khi thanh toán — hủy bất cứ lúc nào.",
    bannerPayCta: "Thanh toán {price} và đọc",
    bannerPayBusy: "Đang mở thanh toán…",
    billedNow: "Mở ngay",
    cancelAnytime: "hủy bất cứ lúc nào",
  },
  id: {
    bannerKicker: "Redaksi ViaLongeVita",
    bannerTitle: "Sisa artikel langsung milik Anda — hanya {price}",
    bannerLead:
      "Hanya {price} per bulan. Paket tahunan mencakup dua bulan. Teks terbuka setelah bayar — batal kapan saja.",
    bannerPayCta: "Bayar {price} dan baca",
    bannerPayBusy: "Membuka pembayaran…",
    billedNow: "Langsung terbuka",
    cancelAnytime: "batal kapan saja",
  },
};

export function getSubscribeCopy(
  locale?: string | null,
  region?: string | null
): SubscribeCopy {
  const key = pack(locale);
  const localized = localizeListedCzkIn(COPY[key] ?? COPY.en, locale, region);
  const overlay = BANNER_OVERLAY[subscribeBannerPack(locale)];
  const edition = subscribeEdition(subscribeBannerPack(locale));
  if (overlay) Object.assign(localized, overlay);
  if (edition) {
    const { plans, audienceByApp, priceNoteByApp, ...rest } = edition;
    Object.assign(localized, rest);
    if (audienceByApp) localized.audienceByApp = { ...localized.audienceByApp, ...audienceByApp };
    if (priceNoteByApp) localized.priceNoteByApp = { ...localized.priceNoteByApp, ...priceNoteByApp };
    if (plans) {
      for (const [tier, pack] of Object.entries(plans)) {
        const key = tier as keyof SubscribeCopy["plans"];
        if (pack?.name && localized.plans[key]) {
          localized.plans[key] = { ...localized.plans[key], name: pack.name };
        }
      }
    }
  }
  localized.afterTrialUnit = localizeCurrencyToken(localized.afterTrialUnit, locale, region);
  localized.currencyLabel = localizeCurrencyToken(localized.currencyLabel, locale, region);
  const price = editorialMonthlyBannerPrice(locale, region);
  localized.bannerTitle = localized.bannerTitle.replaceAll("{price}", price);
  localized.bannerLead = localized.bannerLead.replaceAll("{price}", price);
  localized.bannerPayCta = localized.bannerPayCta.replaceAll("{price}", price);
  return JSON.parse(rewriteCzechInstitutions(JSON.stringify(localized), locale)) as SubscribeCopy;
}
