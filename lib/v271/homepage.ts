/** MedScope v28 — homepage copy and CTA wiring */
import { MAGAZINE } from "@/lib/brand/magazine";
import { V27_SUBSCRIPTION_PLANS } from "@/lib/v27/config";

export const V271_HERO = {
  eyebrow: MAGAZINE.heroEyebrow.cs,
  claim: MAGAZINE.heroClaim.cs,
  subtitle:
    "Magazín ViaLongeVita, wellness deník MediFlow, VIP protokoly a aplikace MeDipacient a OrdiZapis. MeDiprep zůstává pro přípravu na LF. 14 dní zdarma.",
} as const;

export const V271_HERO_CTAS = [
  { label: "Stáhnout aplikace", href: "/aplikace", primary: true },
  { label: "14 dní zdarma", href: "/predplatne?trial=1", primary: false },
  { label: "Ukázkový dashboard", href: "/dashboard", primary: false },
] as const;

export const V271_HERO_APP_CHIPS = [
  { label: "MediFlow", href: "/app/mediflow" },
  { label: "MeDipacient", href: "/app/pacient" },
  { label: "OrdiZapis", href: "/app/dokumentace" },
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
    title: "Magazín + aplikace na jedné platformě",
    description:
      "ViaLongeVita pro dlouhověkost a prevenci, MediFlow pro vlastní deník, MeDipacient a OrdiZapis jako instalovatelné PWA.",
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
    title: "Jedna platforma, více cílových skupin",
    description:
      "Veřejnost, lékaři a studenti mají vlastní sekce — magazín a wellness jsou v popředí, příprava na LF zůstává dostupná v sekci Studenti.",
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
      "ViaLongeVita a MediFlow pro dlouhověkost a prevenci. MeDipacient složí lékařské zprávy do přehledu.",
    topics: ["ViaLongeVita", "MediFlow", "MeDipacient", "prevence", "výživa", "spánek", "longevity"],
    href: "/verejnost",
    ctaPrimary: { label: "Číst magazín", href: "/articles" },
    ctaSecondary: { label: "Otevřít MediFlow", href: "/app/mediflow" },
  },
  {
    id: "physician",
    label: "Lékaři",
    description:
      "OrdiZapis napíše zápis z diktátu v telefonu. K tomu guidelines, studie a Research Hub.",
    topics: ["guidelines", "OrdiZapis", "CME", "studie", "Research Hub"],
    href: "/lekari",
    ctaPrimary: { label: "Stáhnout OrdiZapis", href: "/app/dokumentace" },
    ctaSecondary: { label: "Více o OrdiZapisu", href: "/lekari/dokumentace" },
  },
  {
    id: "student",
    label: "Studenti (legacy)",
    description:
      "MeDiprep a Academy pro přípravu na LF — sekundární nabídka, primárně pro uchazeče o medicínu v ČR.",
    topics: ["MeDiprep", "Academy", "přijímačky", "AI tutor"],
    href: "/studenti",
    ctaPrimary: { label: "MeDiprep", href: "/app/priprava" },
    ctaSecondary: { label: "Chci studovat medicínu", href: "/studenti/chci-studovat" },
  },
] as const;

/** Homepage spotlight — installable physician OrdiZapis app */
export const V271_DOKUMENTACE_APP = {
  eyebrow: "Aplikace pro lékaře · medscopeglobal.com",
  title: "OrdiZapis — nahrávejte v mobilu, zápis je hotový",
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
    "Dlouhověkost a zdravotnické události — redakčně zpracované, s kontextem pro českou praxi.",
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
  "ViaLongeVita — magazín zdraví a dlouhověkosti. MediFlow, VIP protokoly, MeDipacient a OrdiZapis na MedScopeGlobal.com. MeDiprep zůstává pro přípravu na LF.";

/** Audience + proof points for footer „Důvěra a čísla“ */
export const V271_FOOTER_TRUST = {
  audiences: [
    { label: "Veřejnost — ViaLongeVita a MediFlow", href: "/verejnost" },
    { label: "VIP longevity protokoly", href: "/vip/protokoly" },
    { label: "Lékaři — OrdiZapis a guidelines", href: "/lekari/dokumentace" },
    { label: "Studenti — MeDiprep a Academy", href: "/studenti" },
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
