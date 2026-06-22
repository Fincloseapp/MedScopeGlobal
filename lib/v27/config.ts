/** Audience IA, monetization, B2B — production config */

export type V27SubscriptionTier = "public" | "student" | "physician";
export type V27BillingInterval = "month" | "year";

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

export function subscriptionProductId(tier: V27SubscriptionTier, interval: V27BillingInterval): string {
  return interval === "year" ? `${tier}-year` : `${tier}-month`;
}
