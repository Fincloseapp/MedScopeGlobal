/** MedScope v27 — audience IA, monetization, B2B */

export type V27Audience = "public" | "student" | "physician" | "b2b";

export type V27SubscriptionTier = "public" | "student" | "physician";

export type V27BillingInterval = "month" | "year";

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
    href: "/studenti",
    description: "Anatomie, farmakologie, příprava na zkoušky a AI tutor.",
    ctaPrimary: { label: "Chci studovat medicínu", href: "/studenti/chci-studovat" },
    ctaSecondary: { label: "AI tutor", href: "/studenti/ai-tutor" },
    topics: ["anatomie", "farmakologie", "přijímačky", "modelové otázky", "rozhovory se studenty"],
    aiRoute: "/ai-asistent/student",
  },
  physician: {
    id: "physician" as const,
    label: "Pro lékaře",
    shortLabel: "Lékaři",
    href: "/lekari",
    description: "Guidelines, souhrny studií, diagnostické algoritmy, CME a Research Hub.",
    ctaPrimary: { label: "Odborná sekce", href: "/odborna" },
    ctaSecondary: { label: "Klinický AI", href: "/lekari/ai-asistent" },
    topics: ["guidelines", "CME", "Research Hub", "diagnostika", "léčebné algoritmy"],
    aiRoute: "/ai-asistent/lekar",
  },
  b2b: {
    id: "b2b" as const,
    label: "Pro firmy",
    shortLabel: "B2B",
    href: "/firmy",
    description: "Reklama, sponzorství, pharma balíčky a univerzitní partnerství.",
    ctaPrimary: { label: "Ceník inzerce", href: "/firmy/cenik" },
    ctaSecondary: { label: "Kontakt", href: "/inzerce/formular" },
    topics: ["pharma", "kliniky", "laboratoře", "univerzity", "sponzorované články"],
    aiRoute: "/organizace/partnerstvi",
  },
} as const;

export const V27_SUBSCRIPTION_PLANS = [
  {
    tier: "public" as const,
    name: "Veřejnost",
    monthlyCzk: 99,
    annualCzk: 990,
    features: ["Prevence a životní styl", "AI asistent pro veřejnost", "Bez reklam v článcích"],
  },
  {
    tier: "student" as const,
    name: "Student LF",
    monthlyCzk: 149,
    annualCzk: 1490,
    features: ["Kvízy a studijní plány", "AI tutor", "Modelové otázky"],
  },
  {
    tier: "physician" as const,
    name: "Lékař v praxi",
    monthlyCzk: 490,
    annualCzk: 4900,
    features: ["Odborná sekce a guidelines", "CME přehledy", "Klinický AI asistent"],
  },
] as const;

export const V27_COMPARISON_FEATURES = [
  { label: "Magazínové články bez reklam", public: true, student: true, physician: true },
  { label: "AI asistent pro veřejnost", public: true, student: true, physician: true },
  { label: "Prevence a životní styl", public: true, student: true, physician: true },
  { label: "Kvízy a studijní plány", public: false, student: true, physician: true },
  { label: "AI tutor pro studenty LF", public: false, student: true, physician: true },
  { label: "Modelové otázky na přijímačky", public: false, student: true, physician: false },
  { label: "Odborná sekce a guidelines", public: false, student: false, physician: true },
  { label: "CME přehledy a souhrny studií", public: false, student: false, physician: true },
  { label: "Klinický AI asistent", public: false, student: false, physician: true },
  { label: "Research Hub a diagnostické algoritmy", public: false, student: false, physician: true },
  { label: "MedScope Academy (základní kurzy)", public: true, student: true, physician: true },
  { label: "Prioritní notifikace novinek", public: false, student: true, physician: true },
] as const;

export const V27_EXPERT_PDFS = [
  { id: "guidelines-pack", name: "Souhrn guidelines 2026", priceCzk: 199 },
  { id: "diagnostics-algo", name: "Diagnostické algoritmy", priceCzk: 299 },
  { id: "cme-bundle", name: "CME balíček", priceCzk: 399 },
] as const;

export const V27_B2B_PACKAGES = [
  { id: "banner", name: "Banner", priceCzk: 5000, desc: "Měsíční rotace banneru" },
  { id: "sponsored-article", name: "Sponzorovaný článek", priceCzk: 15000, desc: "Editoriální článek s označením partnera" },
  { id: "enterprise", name: "Enterprise", priceCzk: 0, desc: "White-label na míru" },
] as const;

export function parseSubscriptionProductId(productId: string): {
  tier: V27SubscriptionTier;
  interval: V27BillingInterval;
} | null {
  const [tier, interval] = productId.split("-") as [string, string | undefined];
  const validTiers: V27SubscriptionTier[] = ["public", "student", "physician"];
  if (!validTiers.includes(tier as V27SubscriptionTier)) return null;
  const billing: V27BillingInterval = interval === "year" ? "year" : "month";
  return { tier: tier as V27SubscriptionTier, interval: billing };
}

export function subscriptionProductId(tier: V27SubscriptionTier, interval: V27BillingInterval): string {
  return interval === "year" ? `${tier}-year` : `${tier}-month`;
}
