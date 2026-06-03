/** MedScopeGlobal — central project configuration */
export const SITE = {
  name: "MedScopeGlobal",
  tagline: "Klinická inteligence a evidence-based medicína",
  description:
    "Český odborný medicínský magazín pro laiky, studenty medicíny, lékaře a výzkumníky — s citacemi, kurátorským obsahem a větví medicíny od přijímaček po 6. ročník LF.",
  domain: "medscopeglobal.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://medscopeglobal.com"),
  supportEmail: "support@medscopeglobal.com",
  adminNotifyEmail:
    process.env.ADMIN_NOTIFY_EMAIL ?? "dawe.zegzul@seznam.cz",
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
  trialDays: 7,
} as const;
