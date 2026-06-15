/** MedScope v27 — audience IA, monetization, B2B */

export type V27Audience = "public" | "student" | "physician" | "b2b";

export const V27_AUDIENCES = {
  public: {
    id: "public" as const,
    label: "Pro veřejnost",
    shortLabel: "Veřejnost",
    href: "/verejnost",
    description: "Krátké články, prevence, výživa, spánek, fitness a životní styl.",
    ctaPrimary: { label: "Najdi svůj problém", href: "/verejnost/temata" },
    ctaSecondary: { label: "Zeptej se AI", href: "/ai-asistent/verejnost" },
    topics: ["prevence", "výživa", "spánek", "fitness", "ženské zdraví", "mužské zdraví", "long vita"],
    aiRoute: "/ai-asistent/verejnost",
  },
  student: {
    id: "student" as const,
    label: "Pro studenty",
    shortLabel: "Studenti",
    href: "/studium",
    description: "Anatomie, farmakologie, příprava na zkoušky a AI tutor.",
    ctaPrimary: { label: "Chci studovat medicínu", href: "/studium/prijimacky" },
    ctaSecondary: { label: "AI tutor", href: "/ai-asistent/student" },
    topics: ["anatomie", "farmakologie", "přijímačky", "modelové otázky", "rozhovory se studenty"],
    aiRoute: "/ai-asistent/student",
  },
  physician: {
    id: "physician" as const,
    label: "Pro lékaře",
    shortLabel: "Lékaři",
    href: "/pro-lekare",
    description: "Guidelines, souhrny studií, diagnostické algoritmy, CME a Research Hub.",
    ctaPrimary: { label: "Odborná sekce", href: "/odborna" },
    ctaSecondary: { label: "Klinický AI", href: "/ai-asistent/lekar" },
    topics: ["guidelines", "CME", "Research Hub", "diagnostika", "léčebné algoritmy"],
    aiRoute: "/ai-asistent/lekar",
  },
  b2b: {
    id: "b2b" as const,
    label: "Pro firmy",
    shortLabel: "B2B",
    href: "/pro-firmy",
    description: "Reklama, sponzorství, pharma balíčky a univerzitní partnerství.",
    ctaPrimary: { label: "Ceník inzerce", href: "/pro-firmy#ceny" },
    ctaSecondary: { label: "Kontakt", href: "/inzerce/formular" },
    topics: ["pharma", "kliniky", "laboratoře", "univerzity", "sponzorované články"],
    aiRoute: "/organizace/partnerstvi",
  },
} as const;

/** Digital mini-products (public) */
export const V27_MINI_PRODUCTS = [
  { id: "sleep-guide", name: "Průvodce spánkem", priceCzk: 149, slug: "spankovy-pruvodce" },
  { id: "nutrition-plan", name: "Výživový plán na míru", priceCzk: 199, slug: "vyzivovy-plan" },
  { id: "stress-toolkit", name: "Stres a regenerace", priceCzk: 249, slug: "stres-regenerace" },
] as const;

/** Subscription tiers */
export const V27_SUBSCRIPTIONS = {
  student: { id: "student", name: "Student LF", priceCzk: 149, interval: "month" as const },
  physician: { id: "physician", name: "Lékař v praxi", priceCzk: 490, interval: "month" as const },
} as const;

/** Expert PDFs for professionals */
export const V27_EXPERT_PDFS = [
  { id: "guidelines-pack", name: "Souhrn guidelines 2026", priceCzk: 199 },
  { id: "diagnostics-algo", name: "Diagnostické algoritmy", priceCzk: 299 },
  { id: "cme-bundle", name: "CME balíček", priceCzk: 399 },
] as const;

/** B2B pricing tiers */
export const V27_B2B_PACKAGES = [
  { id: "pharma-starter", name: "Pharma Starter", priceCzk: 15000, desc: "Banner + 1 sponzorovaný článek" },
  { id: "clinic-pro", name: "Klinika / Lab Pro", priceCzk: 25000, desc: "Segmentace + kampaň na 3 měsíce" },
  { id: "university", name: "Univerzitní partnerství", priceCzk: 45000, desc: "Studijní obsah + branding LF" },
] as const;
