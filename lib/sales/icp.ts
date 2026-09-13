import type { SalesAudience, SalesIcpSector } from "@/lib/sales/types";

export type IcpSeed = {
  company: string;
  website: string;
  sector: SalesIcpSector;
  country: string;
  audience: SalesAudience;
  why: string;
  /** Never a personal mailbox. Empty until inbound or admin confirms a role address. */
  suggestedRole: string;
};

/**
 * Curated ICP for Czech / EU health advertisers.
 * Websites are public company properties. No personal e-mails are stored here —
 * the runner will not guess or send to invented addresses.
 */
export const SALES_ICP_SEEDS: IcpSeed[] = [
  {
    company: "EUC",
    website: "https://www.euc.cz",
    sector: "clinic",
    country: "CZ",
    audience: "public",
    why: "Síť klinik — poptávky pacientů z magazínu zdraví.",
    suggestedRole: "marketing@",
  },
  {
    company: "Agel",
    website: "https://www.agel.cz",
    sector: "clinic",
    country: "CZ",
    audience: "both",
    why: "Nemocnice a ambulance — nábor i služby.",
    suggestedRole: "marketing@",
  },
  {
    company: "Canadian Medical",
    website: "https://www.canadian.cz",
    sector: "clinic",
    country: "CZ",
    audience: "public",
    why: "Privátní péče, anglicky mluvící klienti.",
    suggestedRole: "info@",
  },
  {
    company: "Unicare Medical Center",
    website: "https://www.unicare.cz",
    sector: "clinic",
    country: "CZ",
    audience: "public",
    why: "Privátní klinika Praha.",
    suggestedRole: "info@",
  },
  {
    company: "Dr. Max",
    website: "https://www.drmax.cz",
    sector: "pharmacy",
    country: "CZ",
    audience: "public",
    why: "Lékárenská síť, OTC a prevence.",
    suggestedRole: "marketing@",
  },
  {
    company: "Benu Česká republika",
    website: "https://www.benu.cz",
    sector: "pharmacy",
    country: "CZ",
    audience: "public",
    why: "Lékárny a e-shop zdraví.",
    suggestedRole: "obchod@",
  },
  {
    company: "Pilulka",
    website: "https://www.pilulka.cz",
    sector: "pharmacy",
    country: "CZ",
    audience: "public",
    why: "E-commerce zdraví a kosmetika.",
    suggestedRole: "marketing@",
  },
  {
    company: "Lékárna.cz",
    website: "https://www.lekarna.cz",
    sector: "pharmacy",
    country: "CZ",
    audience: "public",
    why: "Největší online lékárna v ČR.",
    suggestedRole: "inzerce@",
  },
  {
    company: "LINET",
    website: "https://www.linet.com",
    sector: "medtech",
    country: "CZ",
    audience: "professional",
    why: "Nemocniční lůžka a medtech export.",
    suggestedRole: "marketing@",
  },
  {
    company: "B. Braun Medical",
    website: "https://www.bbraun.cz",
    sector: "medtech",
    country: "CZ",
    audience: "professional",
    why: "Zdravotnické prostředky, B2B k lékařům.",
    suggestedRole: "info@",
  },
  {
    company: "Roche Diagnostics",
    website: "https://www.roche.cz",
    sector: "diagnostics",
    country: "CZ",
    audience: "professional",
    why: "Diagnostika — pouze odborná inzerce.",
    suggestedRole: "media@",
  },
  {
    company: "Siemens Healthineers",
    website: "https://www.siemens-healthineers.com/cz",
    sector: "medtech",
    country: "CZ",
    audience: "professional",
    why: "Zobrazovací systémy, kongresy.",
    suggestedRole: "kontakt@",
  },
  {
    company: "Synlab Czech",
    website: "https://www.synlab.cz",
    sector: "lab",
    country: "CZ",
    audience: "both",
    why: "Laboratoře — poptávky vyšetření.",
    suggestedRole: "info@",
  },
  {
    company: "AeskuLab",
    website: "https://www.aesku.cz",
    sector: "lab",
    country: "CZ",
    audience: "public",
    why: "Odběrová síť a diagnostika.",
    suggestedRole: "info@",
  },
  {
    company: "SPADIA LAB",
    website: "https://www.spadia.cz",
    sector: "lab",
    country: "CZ",
    audience: "both",
    why: "Klinická laboratoř Morava / Slezsko.",
    suggestedRole: "obchod@",
  },
  {
    company: "uLékaře",
    website: "https://www.ulekare.cz",
    sector: "digital_health",
    country: "CZ",
    audience: "public",
    why: "Telemedicína — nesmí slibovat diagnózu v reklamě.",
    suggestedRole: "partnerstvi@",
  },
  {
    company: "GHC Genetics",
    website: "https://www.ghcgenetics.cz",
    sector: "diagnostics",
    country: "CZ",
    audience: "public",
    why: "Genetické testy — přísné zdravotní tvrzení.",
    suggestedRole: "info@",
  },
  {
    company: "Zentiva",
    website: "https://www.zentiva.cz",
    sector: "pharma_rx",
    country: "CZ",
    audience: "professional",
    why: "Rx — jen odborná plocha, SÚKL.",
    suggestedRole: "media@",
  },
  {
    company: "KRKA ČR",
    website: "https://www.krka.biz/cz",
    sector: "pharma_rx",
    country: "CZ",
    audience: "professional",
    why: "Rx / OTC mix — editorial board + SÚKL.",
    suggestedRole: "info@",
  },
  {
    company: "Walmark",
    website: "https://www.walmark.cz",
    sector: "pharma_otc",
    country: "CZ",
    audience: "public",
    why: "Doplňky stravy — veřejný magazín.",
    suggestedRole: "reklama@",
  },
  {
    company: "Guarant International",
    website: "https://www.guarant.cz",
    sector: "congress",
    country: "CZ",
    audience: "professional",
    why: "Lékařské kongresy a eventy.",
    suggestedRole: "sales@",
  },
  {
    company: "C-IN",
    website: "https://www.c-in.eu",
    sector: "congress",
    country: "CZ",
    audience: "professional",
    why: "Kongresový management, medical meetings.",
    suggestedRole: "info@",
  },
  {
    company: "Karolinum Press",
    website: "https://karolinum.cz",
    sector: "publisher",
    country: "CZ",
    audience: "professional",
    why: "Odborné publikace UK.",
    suggestedRole: "obchod@",
  },
  {
    company: "Triton nakladatelství",
    website: "https://www.tridistri.cz",
    sector: "publisher",
    country: "CZ",
    audience: "professional",
    why: "Lékařská literatura.",
    suggestedRole: "obchod@",
  },
  {
    company: "Všeobecná zdravotní pojišťovna",
    website: "https://www.vzp.cz",
    sector: "insurance",
    country: "CZ",
    audience: "public",
    why: "Prevence a osvěta — ne agresivní kampaň.",
    suggestedRole: "tisk@",
  },
];

export function icpAllowsPublicMagazine(sector: SalesIcpSector): boolean {
  return sector !== "pharma_rx";
}

export function icpRequiresProfessionalOnly(sector: SalesIcpSector): boolean {
  return sector === "pharma_rx";
}

export function icpNeedsHumanReview(sector: SalesIcpSector): boolean {
  return (
    sector === "pharma_rx" ||
    sector === "diagnostics" ||
    sector === "digital_health" ||
    sector === "insurance"
  );
}

export function hostnameFromWebsite(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}
