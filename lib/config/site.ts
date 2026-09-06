import { MAGAZINE } from "@/lib/brand/magazine";

/** MedScopeGlobal — central project configuration */
export const SITE = {
  name: "MedScopeGlobal",
  /** Global publication hosted on this platform */
  magazineName: MAGAZINE.name,
  tagline: "ViaLongeVita · MediFlow · MeDipacient · OrdiZapis",
  description:
    "ViaLongeVita — globální magazín zdraví a dlouhověkosti na MedScopeGlobal.com. MediFlow, VIP protokoly, MeDipacient a OrdiZapis. Evidence-based obsah ve 19 jazycích. 14 dní zdarma.",
  domain: "medscopeglobal.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.CF_PAGES_URL
      ? process.env.CF_PAGES_URL.startsWith("http")
        ? process.env.CF_PAGES_URL
        : `https://${process.env.CF_PAGES_URL}`
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
