/** MedScope v28 — homepage copy and CTA wiring */
import { V27_SUBSCRIPTION_PLANS } from "@/lib/v27/config";

export const V271_HERO = {
  eyebrow: "Prémiový zdravotnický magazín",
  claim: "Medicína, kterou čtete s důvěrou — od prvního ročníku po klinickou praxi",
  subtitle:
    "Redakčně kurátorované studie, guidelines a vzdělávání v češtině. Pro ty, kdo chtějí víc než generické zdravotní rady — s citacemi, klinickým dopadem a AI, které rozumí kontextu.",
} as const;

export const V271_HERO_CTAS = [
  { label: "Vyzkoušet 14 dní zdarma", href: "/predplatne?trial=1", primary: true },
  { label: "Předplatit", href: "/predplatne", primary: false },
  { label: "Pro veřejnost", href: "/verejnost", primary: false },
  { label: "Pro studenty", href: "/studenti", primary: false },
  { label: "Pro lékaře", href: "/lekari", primary: false },
] as const;

export const V271_SOCIAL_PROOF_STATS = [
  { value: "2 800+", label: "studentů medicíny" },
  { value: "500+", label: "odborných článků" },
  { value: "1 200+", label: "studijních materiálů" },
  { value: "14 dní", label: "zkušební přístup zdarma" },
] as const;

export const V271_TESTIMONIALS = [
  {
    quote:
      "Konečně český zdroj, kde u každé studie vidím klinický dopad a ne jen abstrakt z PubMedu. Používám to denně před ordinací.",
    author: "MUDr. Petra Horáková",
    role: "internistka, FN Motol",
  },
  {
    quote:
      "Přijímačky jsem zvládla díky strukturovaným kvízům a shrnutím anatomie. Je to jako mít spolužáka, který už prošel šestým ročníkem.",
    author: "Tereza K.",
    role: "6. ročník LF UK Praha",
  },
  {
    quote:
      "Guidelines a lékové novinky v jednom feedu — ušetří mi hodinu týdně oproti procházení deseti různých portálů.",
    author: "MUDr. Jan Procházka",
    role: "revmatolog, Olomouc",
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
    topics: ["prevence", "výživa", "spánek", "fitness", "ženské zdraví", "mužské zdraví"],
    href: "/verejnost",
    ctaPrimary: { label: "Najít téma", href: "/verejnost/temata" },
    ctaSecondary: { label: "Zeptat se AI", href: "/ai-asistent/verejnost" },
  },
  {
    id: "student",
    label: "Studenti",
    description:
      "Anatomie, farmakologie, přijímačky a AI tutor — od prvního dne na LF po státnice.",
    topics: ["anatomie", "farmakologie", "testy", "přijímačky", "zkoušky", "AI tutor"],
    href: "/studenti",
    ctaPrimary: { label: "Chci studovat medicínu", href: "/studenti/chci-studovat" },
    ctaSecondary: { label: "AI tutor", href: "/studenti/ai-tutor" },
  },
  {
    id: "physician",
    label: "Lékaři",
    description:
      "Guidelines, přehledy studií, Research Hub a klinický AI — pro rozhodování v ordinaci, ne v teoretické laboratoři.",
    topics: ["guidelines", "CME", "studie", "diagnostika", "Research Hub"],
    href: "/lekari",
    ctaPrimary: { label: "Odborná sekce", href: "/odborna" },
    ctaSecondary: { label: "Klinický AI", href: "/lekari/ai-asistent" },
  },
] as const;

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
  "Prémiový zdravotnický magazín pro veřejnost, studenty medicíny a lékaře — evidence-based obsah v češtině od roku 2024.";

export const V271_FOOTER_SOCIAL_PROOF = [
  { label: "2 800+ studentů", href: "/studenti" },
  { label: "500+ článků", href: "/articles" },
  { label: "Recenze čtenářů", href: "/predplatne#recenze" },
  { label: "14 dní zdarma", href: "/predplatne?trial=1" },
] as const;
