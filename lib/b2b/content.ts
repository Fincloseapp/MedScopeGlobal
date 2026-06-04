export const ORGANIZACE_SECTIONS = [
  {
    slug: "licence",
    title: "Institucionální licence",
    href: "/organizace/licence",
    description: "Multi-seat přístup pro nemocnice, fakulty a výzkumná centra.",
  },
  {
    slug: "partnerstvi",
    title: "B2B partnerství",
    href: "/organizace/partnerstvi",
    description: "Společné kampaně, edukace a sponzorované sekce.",
  },
  {
    slug: "firemni",
    title: "Firemní přístupy",
    href: "/organizace",
    description: "SSO-ready onboarding a reporting pro týmy.",
  },
  {
    slug: "nemocnice",
    title: "Nabídka pro nemocnice",
    href: "/organizace",
    description: "Klinické guidelines, interní školení a VIP přístupy.",
  },
  {
    slug: "pharma",
    title: "Nabídka pro farmaceutické firmy",
    href: "/organizace/partnerstvi",
    description: "Etické sponzorství studií a edukačních bloků.",
  },
  {
    slug: "vyzkum",
    title: "Nabídka pro výzkumné organizace",
    href: "/studijni-spoluprace",
    description: "Recruitment do studií a publikace výsledků.",
  },
] as const;

export const LICENSE_TIERS = [
  {
    id: "team",
    name: "Team",
    seats: "do 25 uživatelů",
    price: "od 12 900 Kč / měsíc",
    features: ["RBAC", "Citace a export", "Prioritní support"],
  },
  {
    id: "hospital",
    name: "Hospital",
    seats: "do 150 uživatelů",
    price: "individuálně",
    features: ["SSO", "Interní školení", "Sponzorované sekce"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    seats: "neomezeně",
    price: "individuálně",
    features: ["API integrace", "Custom reporting", "Dedikovaný account"],
  },
] as const;

export const PARTNERSHIP_BENEFITS = [
  "Viditelnost v odborných sekcích (diagnózy, studie, digital health)",
  "Etické sponzorství obsahu s jasným označením",
  "Newsletter a kombinované balíčky",
  "AI-assisted reporting a měření engagementu",
  "Onboarding pro marketing i medical affairs",
] as const;
