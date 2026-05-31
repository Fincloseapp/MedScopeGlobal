import { articles, events } from "@/lib/data";
import type { Article } from "@/lib/types";

export type MedicalSection = {
  label: string;
  href: string;
  group: string;
  title: string;
  description: string;
  keywords: string[];
};

export type MedicalNavGroup = {
  label: string;
  href?: string;
  children?: MedicalSection[];
};

export const medicalNavGroups: MedicalNavGroup[] = [
  { label: "HOME", href: "/" },
  {
    label: "PROFESSIONAL",
    children: [
      { label: "Clinical Insights", href: "/professional/clinical-insights", group: "Professional", title: "Clinical Insights", description: "Praktické klinické postřehy a evidence summaries pro lékaře.", keywords: ["klinická praxe", "clinical", "prevence"] },
      { label: "Case Reports", href: "/professional/case-reports", group: "Professional", title: "Case Reports", description: "Kazuisitky, diagnostické lekce a odborné komentáře.", keywords: ["case", "diagnostika", "pacient"] },
      { label: "Guidelines", href: "/professional/guidelines", group: "Professional", title: "Guidelines", description: "Guidelines, doporučení a změny standardu péče.", keywords: ["guidelines", "doporučení", "standard"] }
    ]
  },
  {
    label: "RESEARCH",
    children: [
      { label: "Articles", href: "/research/articles", group: "Research", title: "Research Articles", description: "Výzkumné články s autory, zdroji, tagy a metadata vrstvou.", keywords: ["výzkum", "research", "registry"] },
      { label: "Clinical Studies", href: "/research/clinical-studies", group: "Research", title: "Clinical Studies", description: "Klinické studie, registry a metodické přehledy.", keywords: ["klinická studie", "trial", "registry"] },
      { label: "Preprints", href: "/research/preprints", group: "Research", title: "Preprints", description: "Preprinty a časné signály oddělené od recenzované literatury.", keywords: ["preprint", "výzkum", "early"] },
      { label: "Student Research", href: "/research/student-research", group: "Research", title: "Student Research", description: "Studentský a early-career výzkum s publikačním workflow.", keywords: ["student", "education", "výzkum"] }
    ]
  },
  {
    label: "HEALTHCARE ECONOMICS",
    children: [
      { label: "Costs & DRG", href: "/economics/costs-drg", group: "Healthcare Economics", title: "Costs & DRG", description: "DRG, náklady, reimbursement a nemocniční ekonomika.", keywords: ["DRG", "cost", "ekonomika"] },
      { label: "Insurance", href: "/economics/insurance", group: "Healthcare Economics", title: "Insurance", description: "Pojišťovny, reimbursement trendy a payer policy.", keywords: ["insurance", "pojištění", "reimbursement"] },
      { label: "Market Analysis", href: "/economics/market-analysis", group: "Healthcare Economics", title: "Market Analysis", description: "Market access, zdravotnický trh a institucionální strategie.", keywords: ["market", "B2B", "partner"] }
    ]
  },
  {
    label: "DIGITAL HEALTH",
    children: [
      { label: "eHealth", href: "/digital-health/ehealth", group: "Digital Health", title: "eHealth", description: "Telemedicína, interoperabilita a digitální zdravotnictví.", keywords: ["eHealth", "telemedicína", "interoperabilita"] },
      { label: "AI", href: "/digital-health/ai", group: "Digital Health", title: "AI in Medicine", description: "AI v medicíně, validace, governance a klinická bezpečnost.", keywords: ["AI", "digital", "bezpečnost"] },
      { label: "Systems", href: "/digital-health/systems", group: "Digital Health", title: "Healthcare Data Systems", description: "EHR, datová infrastruktura a zdravotnické systémy.", keywords: ["data", "systems", "interoperabilita"] }
    ]
  },
  {
    label: "REGULATION & POLICY",
    children: [
      { label: "Legislation", href: "/policy/legislation", group: "Regulation & Policy", title: "Legislation", description: "Legislativa a policy změny pro zdravotnictví.", keywords: ["legislation", "policy", "regulation"] },
      { label: "Compliance", href: "/policy/compliance", group: "Regulation & Policy", title: "Compliance", description: "Compliance, GDPR, kvalita a bezpečnost zdravotnických procesů.", keywords: ["compliance", "GDPR", "quality"] },
      { label: "Healthcare Law", href: "/policy/healthcare-law", group: "Regulation & Policy", title: "Healthcare Law", description: "Zdravotnické právo, odpovědnost a regulační kontext.", keywords: ["law", "legal", "policy"] }
    ]
  },
  {
    label: "PHARMA & DRUGS",
    children: [
      { label: "New Drugs", href: "/pharma/new-drugs", group: "Pharma & Drugs", title: "New Drugs", description: "Nová léčiva, regulatory updates a dostupnost léčiv.", keywords: ["farmacie", "léčiv", "regulator"] },
      { label: "Drug Reviews", href: "/pharma/drug-reviews", group: "Pharma & Drugs", title: "Drug Reviews", description: "Drug reviews, farmakovigilance a bezpečnost léčiv.", keywords: ["farmakovigilance", "drug", "léčiv"] },
      { label: "Clinical Trials", href: "/pharma/clinical-trials", group: "Pharma & Drugs", title: "Clinical Trials", description: "Farmaceutické klinické studie a trial intelligence.", keywords: ["trial", "clinical", "farmacie"] }
    ]
  },
  {
    label: "NEWS & UPDATES",
    children: [
      { label: "Daily", href: "/news/daily", group: "News & Updates", title: "Daily News", description: "Denní medicínské novinky a monitoring zdrojů.", keywords: ["denní", "monitoring", "news"] },
      { label: "Key Updates", href: "/news/key-updates", group: "News & Updates", title: "Key Updates", description: "Klíčové update briefs pro kliniky a instituce.", keywords: ["update", "regulator", "public-health"] }
    ]
  },
  {
    label: "CONGRESSES & EVENTS",
    children: [
      { label: "Conferences", href: "/events/conferences", group: "Congresses & Events", title: "Conferences", description: "Konference, kongresy a odborné kalendáře.", keywords: ["konference", "congress", "events"] },
      { label: "Webinars", href: "/events/webinars", group: "Congresses & Events", title: "Webinars", description: "Webináře, online education a odborné série.", keywords: ["webinar", "online", "education"] },
      { label: "Reports", href: "/events/reports", group: "Congresses & Events", title: "Reports", description: "Kongresové reporty a briefingy z odborných událostí.", keywords: ["report", "briefing", "events"] }
    ]
  },
  { label: "CAREERS", href: "/careers" },
  { label: "SUBSCRIBE", href: "/subscribe" }
];

export const medicalSections = medicalNavGroups.flatMap((group) => group.children ?? []);

export function getMedicalSection(path: string): MedicalSection | undefined {
  return medicalSections.find((section) => section.href === path);
}

export function sectionArticles(section: MedicalSection): Article[] {
  const normalizedKeywords = section.keywords.map((keyword) => keyword.toLowerCase());
  const matches = articles.filter((article) => {
    const haystack = [article.title, article.summary, article.content, article.specialization, article.source, article.tags.join(" ")]
      .join(" ")
      .toLowerCase();
    return normalizedKeywords.some((keyword) => haystack.includes(keyword));
  });
  return (matches.length > 0 ? matches : articles).slice(0, 9);
}

export function sectionEvents(section: MedicalSection) {
  if (!section.href.startsWith("/events/")) return [];
  return events.filter((event) => event.approved).slice(0, 6);
}
