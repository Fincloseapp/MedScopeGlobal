/** MedScope v28 — homepage copy and CTA wiring */
import { V27_SUBSCRIPTION_PLANS } from "@/lib/v27/config";

export const V271_HERO = {
  eyebrow: "MedScopeGlobal.com · tři aplikace",
  claim: "Zprávy, přijímačky a zápisy — na ploše telefonu",
  subtitle:
    "MeDipacient pro veřejnost, MeDiprep pro uchazeče o LF a MeDiktor pro ověřené lékaře. Stejné stažení jako u MeDiktoru. 14 dní zdarma.",
} as const;

export const V271_HERO_CTAS = [
  { label: "Stáhnout aplikace", href: "/aplikace", primary: true },
  { label: "14 dní zdarma", href: "/predplatne?trial=1", primary: false },
  { label: "Ukázkový dashboard", href: "/dashboard", primary: false },
] as const;

export const V271_HERO_APP_CHIPS = [
  { label: "MeDipacient", href: "/app/pacient" },
  { label: "MeDiprep", href: "/app/priprava" },
  { label: "MeDiktor", href: "/app/mediktor" },
] as const;

export const V271_SOCIAL_PROOF_STATS = [
  { value: "2 800+", label: "zdravotnických profesionálů a studentů medicíny" },
  { value: "500+", label: "odborných článků" },
  { value: "1 200+", label: "studijních materiálů" },
  { value: "14 dní", label: "zkušební přístup zdarma" },
] as const;

export const V271_TESTIMONIALS = [
  {
    quote:
      "Konečně český zdroj, kde u každé studie vidím klinický dopad a ne jen abstrakt z PubMedu. Používám to denně před ordinací.",
    author: "MUDr. A. V., Ph.D.",
    role: "interní medicína · fakultní nemocnice (ČR)",
  },
  {
    quote:
      "Zkušební osu zpráv vidím hned — diagnózy, léky i otázky k lékaři. Pak dává smysl nahrát vlastní PDF.",
    author: "Uživatelka MeDipacient",
    role: "veřejnost · Praha",
  },
  {
    quote:
      "Přijímačky jsem zvládla díky strukturovaným kvízům a shrnutím anatomie. Je to jako mít spolužáka, který už prošel šestým ročníkem.",
    author: "Studentka medicíny",
    role: "6. ročník lékařské fakulty (ČR)",
  },
  {
    quote:
      "Guidelines a lékové novinky v jednom feedu — ušetří mi hodinu týdně oproti procházení deseti různých portálů.",
    author: "MUDr. M. L., Ph.D.",
    role: "revmatologie · ambulantní praxe (ČR)",
  },
] as const;

export const V271_WHY_TRUST = [
  {
    title: "Tři aplikace, jedno prostředí",
    description:
      "MeDipacient, MeDiprep a MeDiktor stáhnete na plochu telefonu. Zkušební dashboardy ukazují, co umí, ještě před předplatným.",
  },
  {
    title: "Evidence-based, ne clickbait",
    description:
      "Každý odborný text vychází z ověřených zdrojů — PubMed, SÚKL, EMA, WHO — s transparentními citacemi a redakční kontrolou.",
  },
  {
    title: "Klinický dopad u každé studie",
    description:
      "Nejen „co studie říká“, ale co to znamená pro praxi, pacienta nebo zkoušku. Shrnutí psaná pro lékaře, ne pro algoritmy.",
  },
  {
    title: "Jedna platforma, tři světy",
    description:
      "Veřejnost, studenti a lékaři mají vlastní sekce, AI asistenty a obsah — bez zbytečného šumu z jiných cílových skupin.",
  },
  {
    title: "Academy s certifikáty",
    description:
      "Interaktivní kurzy, kvízy a gamifikace pro studenty i CME obsah pro praktiky — ne krátké placeholder lekce.",
  },
  {
    title: "14 dní na vyzkoušení",
    description:
      "Plný přístup ke všem tarifům bez závazku. Platba až po uplynutí zkušební doby — Stripe, Apple Pay, Google Pay.",
  },
] as const;

export const V271_AUDIENCES = [
  {
    id: "public",
    label: "Veřejnost",
    description:
      "MeDipacient složí lékařské zprávy do přehledu. K tomu prevence a životní styl bez sensace.",
    topics: ["MeDipacient", "prevence", "výživa", "spánek", "fitness", "ženské zdraví", "mužské zdraví"],
    href: "/verejnost",
    ctaPrimary: { label: "Stáhnout MeDipacient", href: "/app/pacient" },
    ctaSecondary: { label: "Najít téma", href: "/verejnost/temata" },
  },
  {
    id: "student",
    label: "Studenti",
    description:
      "MeDiprep ukáže mezery v B/C/F. K tomu Academy, AI tutor a materiály od přijímaček po státnice.",
    topics: ["MeDiprep", "anatomie", "farmakologie", "testy", "přijímačky", "AI tutor"],
    href: "/studenti",
    ctaPrimary: { label: "Stáhnout MeDiprep", href: "/app/priprava" },
    ctaSecondary: { label: "Chci studovat medicínu", href: "/studenti/chci-studovat" },
  },
  {
    id: "physician",
    label: "Lékaři",
    description:
      "MeDiktor napíše zápis z diktátu v telefonu. K tomu guidelines, studie a Research Hub.",
    topics: ["guidelines", "MeDiktor", "CME", "studie", "Research Hub"],
    href: "/lekari",
    ctaPrimary: { label: "Více o MeDiktoru", href: "/mediktor" },
    ctaSecondary: { label: "Ceník od 390 Kč", href: "/mediktor/ceny" },
  },
] as const;

/** Homepage spotlight — installable physician MeDiktor app */
export const V271_DOKUMENTACE_APP = {
  eyebrow: "Aplikace pro lékaře · medscopeglobal.com",
  title: "MeDiktor — nahrávejte v mobilu, zápis je hotový",
  description:
    "Diktát do telefonu, nebo nahrávka konzultace s pacientem či pacientkou → odborná anamnéza a klinický zápis. Stažení pro ověřené lékaře, účet MedScopeGlobal.",
  href: "/mediktor",
  pricingHref: "/mediktor/ceny",
  appHref: "/app/mediktor",
  price: "390 Kč / měsíc",
  trial: "14 dní zdarma",
} as const;

export const V271_B2B = {
  title: "Pro firmy a instituce",
  description:
    "Pharma, kliniky, laboratoře a univerzity — cílená reklama, odborné kampaně a partnerství s měřitelným dopadem.",
  href: "/firmy",
  cta: "B2B nabídka",
} as const;

export const V271_AKTUALNI = {
  title: "Aktuální zprávy",
  description:
    "Domácí i zahraniční zdravotnické události — redakčně zpracované, s kontextem pro českou praxi.",
  href: "/aktualni-zpravy",
  cta: "Číst zprávy",
  links: [
    { label: "Aktuální zprávy", href: "/aktualni-zpravy" },
    { label: "Studie", href: "/studie" },
    { label: "Léky", href: "/leky" },
    { label: "Novinky", href: "/novinky" },
  ],
} as const;

export const V271_SUBSCRIPTION_PLANS = V27_SUBSCRIPTION_PLANS;

export const V271_FOOTER_TAGLINE =
  "MeDipacient, MeDiprep a MeDiktor plus evidence-based obsah v češtině — pro veřejnost, studenty medicíny a lékaře.";

/** Audience + proof points for footer „Důvěra a čísla“ */
export const V271_FOOTER_TRUST = {
  audiences: [
    { label: "Veřejnost — MeDipacient a osvěta", href: "/verejnost" },
    { label: "Studenti — MeDiprep a Academy", href: "/studenti" },
    { label: "Lékaři — MeDiktor a guidelines", href: "/mediktor" },
    { label: "Zdravotníci a zdravotní profesionálové", href: "/odborna" },
  ],
  proof: [
    { label: "2 800+ zdravotnických profesionálů a studentů medicíny", href: "/studenti" },
    { label: "500+ evidence-based článků", href: "/articles" },
    { label: "Recenze čtenářů", href: "/predplatne#recenze" },
    { label: "14 dní zdarma", href: "/predplatne?trial=1" },
  ],
} as const;

/** @deprecated Prefer V271_FOOTER_TRUST — kept for any legacy imports */
export const V271_FOOTER_SOCIAL_PROOF = [
  ...V271_FOOTER_TRUST.audiences,
  ...V271_FOOTER_TRUST.proof,
] as const;
