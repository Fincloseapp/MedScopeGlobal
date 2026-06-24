export const siteConfig = {
  name: "MedScopeGlobal",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://medscopeglobal.com",
  description:
    "Odborný medicínský magazín a monitoring pro studenty, lékaře a výzkumníky.",
  contactEmail: process.env.CONTACT_EMAIL || "info@medscopeglobal.com",
  adsEmail: process.env.ADS_EMAIL || "ads@medscopeglobal.com",
  locale: "cs_CZ"
};

export const navItems = [
  { href: "/", label: "Domů" },
  { href: "/articles", label: "Články" },
  { href: "/pro-koho", label: "Pro koho" },
  { href: "/medicina", label: "Medicína" },
  { href: "/portal", label: "Portál" },
  { href: "/premium", label: "Premium" },
  { href: "/education", label: "Vzdělávání" },
  { href: "/events", label: "Události" },
  { href: "/jobs", label: "Kariéra" },
  { href: "/contact", label: "Kontakt" }
] as const;

export const footerSections = [
  {
    title: "Čtenáři",
    links: [
      { href: "/pro-koho/laik-student", label: "Laik a student" },
      { href: "/pro-koho/lekar", label: "Lékař v praxi" },
      { href: "/pro-koho/vedec", label: "Vědec a výzkum" },
      { href: "/medicina/priprava", label: "Příprava na medicínu" },
      { href: "/medicina/studium", label: "Studium medicíny" }
    ]
  },
  {
    title: "Obsah",
    links: [
      { href: "/articles", label: "Monitoring článků" },
      { href: "/portal/articles", label: "Odborné články" },
      { href: "/premium", label: "Premium" },
      { href: "/knowledge", label: "Knowledge produkty" }
    ]
  },
  {
    title: "Platforma",
    links: [
      { href: "/institutions", label: "Instituce" },
      { href: "/b2b", label: "B2B partnerství" },
      { href: "/education", label: "Vzdělávání" },
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
