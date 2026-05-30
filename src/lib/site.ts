export const siteConfig = {
  name: "MedScopeGlobal",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://medscopeglobal.com",
  description: "Globální platforma pro sdílení medicínských poznatků.",
  contactEmail: process.env.CONTACT_EMAIL || "info@medscopeglobal.com",
  adsEmail: process.env.ADS_EMAIL || "ads@medscopeglobal.com",
  locale: "cs_CZ"
};

export const navItems = [
  { href: "/", label: "Domů" },
  { href: "/portal", label: "Portál" },
  { href: "/portal/articles", label: "Články" },
  { href: "/articles", label: "Monitoring" },
  { href: "/events", label: "Události" },
  { href: "/auth/login", label: "Přihlášení" },
  { href: "/contact", label: "Kontakt" }
] as const;
