import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizeCurrencyToken, localizeListedCzkIn } from "@/lib/i18n/payment-currency";
import { rewriteCzechInstitutions } from "@/lib/i18n/local-regulator";
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
      "Čtěte o dlouhověkosti zdarma. Veřejnost, OrdiZapis a lékař: 14 dní. Student LF: 1 test, 89 Kč, pak 149 Kč. Zrušení kdykoli. Platba kartou přes Stripe.",
    eyebrow: "Předplatné",
    title: "Dlouhověkost srozumitelně — vyzkoušejte 14 dní",
    lead: "Články o healthspanu zůstávají čitelné. Veřejnost, OrdiZapis a lékař: 14 dní zdarma. Student LF: 1 test zdarma, první měsíc 89 Kč, další 149 Kč. Zrušení kdykoli.",
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
    choosePlanLead: "Veřejnost, OrdiZapis a lékař: 14 dní zdarma. Student LF: 1 test zdarma, první měsíc 89 Kč, další 149 Kč. Zrušíte kdykoli. Po kliknutí přejdete na Stripe.",
    bestForClinic: "Nejvýhodnější pro ordinaci",
    mostPopular: "Nejoblíbenější",
    daysFree: "14 dní zdarma",
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
    supportTitle: "Nechcete předplatné? Stačí číst dál",
    supportLead:
      "Magazín zůstává otevřený. Pokud vám po dočtení článku dává smysl redakci podpořit, můžete přispět jednorázově — bez účtu a bez závazku. Předplatné je volitelné.",
    supportCta: "Otevřít články o dlouhověkosti",
    keepReading: "Číst dál zdarma",
    comparisonTitle: "Srovnání tarifů",
    comparisonLead:
      "Přehled funkcí podle cílové skupiny. Veřejnost, OrdiZapis a Lékař: 14denní zkušební verze. Student LF: 1 test zdarma, 89 Kč, pak 149 Kč. OrdiZapis (390 Kč) je samostatný nástroj pro zápisy; Lékař v praxi (490 Kč) přidává CME, Research Hub a klinický AI.",
    featureCol: "Funkce",
    included: "Zahrnuto",
    notIncluded: "Nezahrnuto",
    faqTitle: "Časté dotazy",
    faq: [
      {
        q: "Jak funguje 14denní zkušební verze?",
        a: "Veřejnost, OrdiZapis a lékař: po zadání karty máte 14 dní zdarma, pak se spustí předplatné. Student LF nemá 14denní trial — 1 test zdarma, první měsíc 89 Kč, další měsíce 149 Kč. Zrušíte kdykoli před dalším inkasem.",
      },
      {
        q: "Mohu předplatné kdykoli zrušit?",
        a: "Ano. Zrušení probíhá v sekci Účet nebo ve Stripe zákaznickém portálu. Přístup zůstane aktivní do konce zaplaceného období.",
      },
      {
        q: "Jaký tarif zvolit?",
        a: "Veřejnost (99 Kč) — prevence, životní styl a AI pro laiky. Student LF (89 Kč první měsíc, pak 149 Kč / v EU 10 €) — materiály, kvízy a AI tutor. Lékař v praxi (490 Kč) — odborná sekce, guidelines, CME a klinický AI.",
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
      { title: "Zrušení kdykoli", description: "Předplatné spravujete v účtu. Po zkušební době bez skrytých poplatků." },
    ],
    privacy: "Zásady ochrany osobních údajů",
    terms: "Obchodní podmínky",
    noAccountTitle: "Ještě nemáte účet?",
    noAccountLead: "Zaregistrujte se zdarma, poté se vraťte sem a aktivujte zkušební verzi vybraného tarifu.",
    createAccount: "Vytvořit účet zdarma",
    b2bNote: "B2B nabídka pro firmy na",
    contact: "kontakt",
    plans: {
      public: {
        name: "Veřejnost",
        features: [
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
          "149 Kč = Student LF (Academy) — longevity články zůstávají v magazínu zdarma",
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
      medipacient: "14 dní zdarma, potom",
      mediprep: "1 test zdarma, první měsíc 89 Kč, potom 149 Kč",
      ordizapis: "14 dní zdarma, potom",
      mediflow: "14 dní zdarma s předplatným Veřejnost",
    },
  },
  en: {
    metaTitle: "Subscription | ViaLongeVita",
    metaDescription:
      "Read about longevity for free. Public, OrdiZapis and physician: 14 days. Student: 1 free test, intro month, then 149 CZK / €10. Cancel anytime. Card payment via Stripe.",
    eyebrow: "Subscription",
    title: "Longevity in plain language — try 14 days",
    lead: "Healthspan articles stay readable. Public, OrdiZapis and physician: 14 days free. Student: 1 free test, intro month, then 149 CZK / €10. Cancel anytime.",
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
    choosePlanLead: "Public, OrdiZapis and physician: 14-day trial. Student LF: 1 free test, intro month, then 149 CZK / €10. Cancel anytime. Checkout opens Stripe.",
    bestForClinic: "Best value for the clinic",
    mostPopular: "Most popular",
    daysFree: "14 days free",
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
    supportTitle: "No plan needed — keep reading",
    supportLead:
      "The magazine stays open. If an article helped, you can leave a one-off contribution — no account, no commitment. A subscription is optional.",
    supportCta: "Open longevity articles",
    keepReading: "Keep reading free",
    comparisonTitle: "Compare plans",
    comparisonLead:
      "Features by audience. Public, OrdiZapis and Physician: 14-day trial. Student: 1 free test, intro month, then 149 CZK / €10. OrdiZapis (390 CZK) is the documentation app; Physician (490 CZK) adds CME, Research Hub and clinical AI.",
    featureCol: "Feature",
    included: "Included",
    notIncluded: "Not included",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "How does the 14-day trial work?",
        a: "Public, OrdiZapis and physician: after you enter a card via Stripe, the first 14 days are not billed. Student LF has no 14-day trial — 1 free test, an intro month, then 149 CZK / €10. Cancel anytime before the next charge.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Cancel in Account or the Stripe customer portal. Access stays active until the end of the paid period.",
      },
      {
        q: "Which plan should I choose?",
        a: "Public (99 CZK) — prevention, lifestyle and public AI. Medical student (intro month, then 149 CZK / €10) — study materials, quizzes and AI tutor. Physician (490 CZK) — professional desk, guidelines, CME and clinical AI.",
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
      { title: "Cancel anytime", description: "Manage the subscription in your account. No hidden fees after the trial." },
    ],
    privacy: "Privacy policy",
    terms: "Terms",
    noAccountTitle: "No account yet?",
    noAccountLead: "Create a free account, then come back here to start the trial for your plan.",
    createAccount: "Create a free account",
    b2bNote: "B2B offer for organisations at",
    contact: "contact",
    plans: {
      public: {
        name: "Public",
        features: [
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
          "149 CZK = Academy student — magazine longevity stays free to read",
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
      medipacient: "14 days free, then",
      mediprep: "1 free test, intro month, then 149 CZK / €10",
      ordizapis: "14 days free, then",
      mediflow: "14 days free with the Public plan",
    },
  },
  de: {
    metaTitle: "Abo | ViaLongeVita",
    metaDescription:
      "Langlebigkeit frei lesen. Öffentlichkeit, OrdiZapis und Arzt: 14 Tage. Studium: 1 Test frei, Einstiegsmonat 6 €, danach 10 €. Jederzeit kündbar. Zahlung per Stripe.",
    eyebrow: "Abo",
    title: "Langlebigkeit verständlich — 14 Tage testen",
    lead: "Healthspan-Artikel bleiben lesbar. Öffentlichkeit, OrdiZapis und Arzt: 14 Tage kostenlos. Medizinstudium: 1 Test frei, Einstiegsmonat 6 €, danach 10 €. Jederzeit kündbar.",
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
    choosePlanLead: "Öffentlichkeit, OrdiZapis und Arzt: 14 Tage kostenlos. Medizinstudium: 1 Test frei, erster Monat 6 €, danach 10 €. Jederzeit kündbar. Die Kasse öffnet Stripe.",
    bestForClinic: "Bestes Preis-Leistungs-Verhältnis für die Praxis",
    mostPopular: "Beliebtester Tarif",
    daysFree: "14 Tage kostenlos",
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
    supportTitle: "Kein Abo nötig — weiterlesen",
    supportLead:
      "Das Magazin bleibt offen. Wenn ein Artikel geholfen hat, können Sie einmalig beitragen — ohne Konto, ohne Verpflichtung. Ein Abo ist freiwillig.",
    supportCta: "Artikel zur Langlebigkeit öffnen",
    keepReading: "Kostenlos weiterlesen",
    comparisonTitle: "Tarifvergleich",
    comparisonLead:
      "Funktionen nach Zielgruppe. Öffentlichkeit, OrdiZapis und Arzt: 14 Tage Test. Medizinstudium: 1 Test frei, 6 €, danach 10 €. OrdiZapis (390 CZK) ist die Dokumentations-App; Arzt in der Praxis (490 CZK) ergänzt CME, Research Hub und klinische KI.",
    featureCol: "Funktion",
    included: "Enthalten",
    notIncluded: "Nicht enthalten",
    faqTitle: "Häufige Fragen",
    faq: [
      {
        q: "Wie funktioniert die 14-tägige Testphase?",
        a: "Öffentlichkeit, OrdiZapis und Arzt: nach Karteneingabe bei Stripe sind die ersten 14 Tage unentgeltlich. Medizinstudium hat keinen 14-Tage-Test — 1 Test frei, Einstiegsmonat 6 €, danach 10 €. Kündigung vor der nächsten Abbuchung.",
      },
      {
        q: "Kann ich jederzeit kündigen?",
        a: "Ja. Kündigung im Konto oder im Stripe-Kundenportal. Der Zugang bleibt bis zum Ende des bezahlten Zeitraums aktiv.",
      },
      {
        q: "Welchen Tarif soll ich wählen?",
        a: "Öffentlichkeit (99 CZK) — Prävention, Lebensstil und öffentliche KI. Medizinstudium (6 €, danach 10 €) — Lernmaterial, Quiz und KI-Tutor. Arzt in der Praxis (490 CZK) — Fachredaktion, Leitlinien, CME und klinische KI.",
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
      { title: "Jederzeit kündbar", description: "Abo im Konto verwalten. Keine versteckten Gebühren nach dem Test." },
    ],
    privacy: "Datenschutz",
    terms: "AGB",
    noAccountTitle: "Noch kein Konto?",
    noAccountLead: "Kostenlos registrieren, dann hier den Testzeitraum des gewählten Tarifs starten.",
    createAccount: "Kostenloses Konto anlegen",
    b2bNote: "B2B-Angebot für Unternehmen unter",
    contact: "Kontakt",
    plans: {
      public: {
        name: "Öffentlichkeit",
        features: [
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
          "10 € = Academy-Student — Langlebigkeitsartikel bleiben im Magazin frei lesbar",
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
      medipacient: "14 Tage kostenlos, dann",
      mediprep: "1 Test frei, Einstiegsmonat 6 €, danach 10 €",
      ordizapis: "14 Tage kostenlos, dann",
      mediflow: "14 Tage kostenlos mit dem Öffentlichkeit-Tarif",
    },
  },
  fr: {
    metaTitle: "Abonnement | ViaLongeVita",
    metaDescription:
      "Lisez la longévité librement. Grand public, OrdiZapis et médecin : 14 jours. Étudiant : 1 test offert, premier mois 6 €, puis 10 €. Résiliation à tout moment. Paiement par carte via Stripe.",
    eyebrow: "Abonnement",
    title: "La longévité en clair — 14 jours d’essai",
    lead: "Les articles healthspan restent lisibles. Grand public, OrdiZapis et médecin : 14 jours gratuits. Étudiant : 1 test offert, premier mois 6 €, puis 10 €. Résiliation à tout moment.",
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
    choosePlanLead: "Grand public, OrdiZapis et médecin : 14 jours gratuits. Étudiant : 1 test offert, premier mois 6 €, puis 10 €. Résiliation à tout moment. Le paiement s’ouvre sur Stripe.",
    bestForClinic: "Meilleur rapport pour le cabinet",
    mostPopular: "La plus populaire",
    daysFree: "14 jours gratuits",
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
    supportTitle: "Pas d’abonnement ? Continuez à lire",
    supportLead:
      "Le magazine reste ouvert. Si un article vous a aidé, vous pouvez contribuer une fois — sans compte, sans engagement. L’abonnement est facultatif.",
    supportCta: "Ouvrir les articles sur la longévité",
    keepReading: "Continuer à lire gratuitement",
    comparisonTitle: "Comparer les formules",
    comparisonLead:
      "Fonctions par public. Grand public, OrdiZapis et Médecin : 14 jours d’essai. Étudiant : 1 test offert, 6 €, puis 10 €. OrdiZapis (390 CZK) est l’appli de notes ; Médecin en exercice (490 CZK) ajoute FMC, Research Hub et IA clinique.",
    featureCol: "Fonction",
    included: "Inclus",
    notIncluded: "Non inclus",
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Comment fonctionne l’essai de 14 jours ?",
        a: "Grand public, OrdiZapis et médecin : après saisie de carte via Stripe, les 14 premiers jours ne sont pas facturés. L’étudiant n’a pas d’essai 14 jours — 1 test offert, premier mois 6 €, puis 10 €. Résiliation avant le prochain prélèvement.",
      },
      {
        q: "Puis-je résilier à tout moment ?",
        a: "Oui. Résiliation dans Compte ou le portail client Stripe. L’accès reste actif jusqu’à la fin de la période payée.",
      },
      {
        q: "Quelle formule choisir ?",
        a: "Grand public (99 CZK) — prévention, mode de vie et IA grand public. Étudiant (6 €, puis 10 €) — supports, quiz et tuteur IA. Médecin (490 CZK) — bureau professionnel, guidelines, FMC et IA clinique.",
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
      { title: "Résiliation à tout moment", description: "Gérez l’abonnement dans le compte. Pas de frais cachés après l’essai." },
    ],
    privacy: "Politique de confidentialité",
    terms: "Conditions",
    noAccountTitle: "Pas encore de compte ?",
    noAccountLead: "Créez un compte gratuit, puis revenez ici pour lancer l’essai de votre formule.",
    createAccount: "Créer un compte gratuit",
    b2bNote: "Offre B2B pour les organisations sur",
    contact: "contact",
    plans: {
      public: {
        name: "Grand public",
        features: [
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
          "10 € = étudiant Academy — les articles longévité restent libres à lire",
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
      medipacient: "14 jours gratuits, puis",
      mediprep: "1 test offert, premier mois 6 €, puis 10 €",
      ordizapis: "14 jours gratuits, puis",
      mediflow: "14 jours gratuits avec la formule Grand public",
    },
  },
};

export function getSubscribeCopy(
  locale?: string | null,
  region?: string | null
): SubscribeCopy {
  const key = pack(locale);
  const localized = localizeListedCzkIn(COPY[key] ?? COPY.en, locale, region);
  localized.afterTrialUnit = localizeCurrencyToken(localized.afterTrialUnit, locale, region);
  localized.currencyLabel = localizeCurrencyToken(localized.currencyLabel, locale, region);
  return JSON.parse(rewriteCzechInstitutions(JSON.stringify(localized), locale)) as SubscribeCopy;
}
