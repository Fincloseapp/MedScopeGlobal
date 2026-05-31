export const siteConfig = {
  name: "MedScopeGlobal",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://medscopeglobal.com",
  description: "Prémiová globální platforma pro medicínské znalosti, vzdělávání a institucionální spolupráci.",
  contactEmail: process.env.CONTACT_EMAIL || "info@medscopeglobal.com",
  adsEmail: process.env.ADS_EMAIL || "ads@medscopeglobal.com",
  locale: "cs_CZ"
};

export const navItems = [
  { href: "/", label: "Domů" },
  { href: "/portal", label: "Portál" },
  { href: "/articles", label: "Monitoring" },
  { href: "/premium", label: "Premium" },
  { href: "/institutions", label: "Instituce" },
  { href: "/events", label: "Události" },
  { href: "/education", label: "Vzdělávání" },
  { href: "/jobs", label: "Kariéra" },
  { href: "/contact", label: "Kontakt" }
] as const;

export const footerSections = [
  {
    title: "Znalosti",
    links: [
      { href: "/portal/articles", label: "Odborné články" },
      { href: "/articles", label: "Monitoring" },
      { href: "/knowledge", label: "Knowledge produkty" },
      { href: "/premium", label: "Premium členství" }
    ]
  },
  {
    title: "Pro organizace",
    links: [
      { href: "/institutions", label: "Institucionální licence" },
      { href: "/b2b", label: "B2B partnerství" },
      { href: "/events", label: "Události" },
      { href: "/jobs", label: "Kariéra / nábor" }
    ]
  },
  {
    title: "Platforma",
    links: [
      { href: "/education", label: "Vzdělávání" },
      { href: "/dashboard", label: "Preference / newsletter" },
      { href: "/auth/login", label: "Přihlášení" },
      { href: "/auth/register", label: "Registrace" },
      { href: "/about", label: "O platformě" }
    ]
  }
] as const;

export const trustSignals = [
  "Editorial review workflow",
  "Citace a metadata u každého článku",
  "RBAC pro odborníky a instituce",
  "Supabase-backed persistence",
  "GDPR-ready formuláře"
] as const;
