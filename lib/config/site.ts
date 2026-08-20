/** MedScopeGlobal — central project configuration */
export const SITE = {
  name: "MedScopeGlobal",
  tagline: "MeDipacient · MeDiprep · MeDiktor",
  description:
    "MeDipacient, MeDiprep a MeDiktor na ploše telefonu. Evidence-based medicína v češtině pro veřejnost, studenty LF a lékaře. 14 dní zdarma.",
  domain: "medscopeglobal.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.CF_PAGES_URL
      ? process.env.CF_PAGES_URL.startsWith("http")
        ? process.env.CF_PAGES_URL
        : `https://${process.env.CF_PAGES_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://medscopeglobal.com"),
  supportEmail: "info@medscopeglobal.com",
  adminNotifyEmail:
    process.env.ADMIN_NOTIFY_EMAIL ?? "info@medscopeglobal.com",
  colors: {
    primary: "#005B96",
    white: "#FFFFFF",
    secondary: "#C7E3FF",
  },
} as const;

export const PRICING = {
  basicMonthlyCzk: 149,
  vipMonthlyCzk: 499,
  yearlyCzk: 2490,
  trialDays: 14,
} as const;
