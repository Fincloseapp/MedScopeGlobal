/** MedScope v28 — homepage copy and CTA wiring */
import { V27_SUBSCRIPTION_PLANS } from "@/lib/v27/config";

export const V271_HERO = {
  eyebrow: "Zdravotnické prostředí MedScopeGlobal.com",
  claim: "Zdraví, vzdělávání a výzkum na jednom místě — pro veřejnost, studenty, lékaře i vědce",
  subtitle:
    "Tři aplikace na ploše telefonu: MeDipacient (zprávy), MeDiprep (přijímačky) a MeDiktor (zápisy). Plus redakce, Academy a Research Hub. 14 dní zdarma.",
} as const;

export const V271_HERO_CTAS = [
  { label: "Stáhnout aplikace", href: "/aplikace", primary: true },
  { label: "Vyzkoušet 14 dní zdarma", href: "/predplatne?trial=1", primary: false },
  { label: "MeDipacient", href: "/app/pacient", primary: false },
  { label: "MeDiprep", href: "/app/priprava", primary: false },
  { label: "MeDiktor", href: "/app/dokumentace", primary: false },
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
      "Prevence a životní styl bez sensace — srozumitelné články od odborníků, ne od influencerů.",
    topics: ["MeDipacient", "prevence", "výživa", "spánek", "fitness", "ženské zdraví", "mužské zdraví"],
    href: "/verejnost",
    ctaPrimary: { label: "Stáhnout MeDipacient", href: "/app/pacient" },
    ctaSecondary: { label: "Najít téma", href: "/verejnost/temata" },
  },
  {
    id: "student",
    label: "Studenti",
    description:
      "Anatomie, farmakologie, přijímačky a AI tutor — od prvního dne na LF po státnice.",
    topics: ["MeDiprep", "anatomie", "farmakologie", "testy", "přijímačky", "AI tutor"],
    href: "/studenti",
    ctaPrimary: { label: "Stáhnout MeDiprep", href: "/app/priprava" },
    ctaSecondary: { label: "Chci studovat medicínu", href: "/studenti/chci-studovat" },
  },
  {
    id: "physician",
    label: "Lékaři",
    description:
      "Guidelines, přehledy studií, Research Hub a klinický AI — pro rozhodování v ordinaci, ne v teoretické laboratoři.",
    topics: ["guidelines", "MeDiktor", "CME", "studie", "Research Hub"],
    href: "/lekari",
    ctaPrimary: { label: "Stáhnout MeDiktor", href: "/app/dokumentace" },
    ctaSecondary: { label: "Více o MeDiktoru", href: "/lekari/dokumentace" },
  },
] as const;

/** Homepage spotlight — installable physician MeDiktor app */
export const V271_DOKUMENTACE_APP = {
  eyebrow: "Aplikace pro lékaře · medscopeglobal.com",
  title: "MeDiktor — nahrávejte v mobilu, zápis je hotový",
  description:
    "Diktát do telefonu, nebo nahrávka konzultace s pacientem či pacientkou → odborná anamnéza a klinický zápis. Stažení pro ověřené lékaře, účet MedScopeGlobal.",
  href: "/lekari/dokumentace",
  appHref: "/app/dokumentace",
  price: "390 Kč / měsíc",
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
  "Prémiový zdravotnický magazín pro veřejnost, studenty medicíny, lékaře a zdravotníky — evidence-based obsah v češtině od roku 2024.";

/** Audience + proof points for footer „Důvěra a čísla“ */
export const V271_FOOTER_TRUST = {
  audiences: [
    { label: "Veřejnost — srozumitelná zdravotní osvěta", href: "/verejnost" },
    { label: "Studenti medicíny — Academy a materiály", href: "/studenti" },
    { label: "Lékaři — MeDiktor a guidelines", href: "/lekari/dokumentace" },
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
