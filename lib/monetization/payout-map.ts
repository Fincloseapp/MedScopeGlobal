/**
 * Where ViaLongeVita money actually lands.
 * Admin UI only — never invent live Amazon / Heureka / AdSense IDs.
 */

import { DEFAULT_HEUREKA_CZ_HAFF } from "@/lib/monetization/heureka-affiliate";

export type PayoutChannelId =
  | "stripe"
  | "heureka-cz"
  | "heureka-sk"
  | "amazon"
  | "adsense"
  | "b2b";

export type PayoutChannel = {
  id: PayoutChannelId;
  title: string;
  whatEarns: string;
  whereYouSeeMoney: string;
  payoutTo: string;
  signupUrl: string;
  signupLabel: string;
  envVars: string[];
  priority: 1 | 2 | 3;
};

export const PAYOUT_CHANNELS: PayoutChannel[] = [
  {
    id: "stripe",
    title: "Stripe — předplatné a tipy",
    whatEarns: "Veřejné předplatné, 14denní trial, dobrovolné tipy u článků.",
    whereYouSeeMoney: "https://dashboard.stripe.com/balance a Výplaty (Payouts).",
    payoutTo: "Firemní účet napojený ve Stripe (Al Synaptica / účet, který tam zadáte).",
    signupUrl: "https://dashboard.stripe.com/",
    signupLabel: "Otevřít Stripe Dashboard",
    envVars: ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
    priority: 1,
  },
  {
    id: "heureka-cz",
    title: "Heureka Affiliate (Česko)",
    whatEarns: "Prokliky CZ čtenářů z /go/* na Heureka.cz — provize za klik i za nákup na Marketplace.",
    whereYouSeeMoney: "https://affiliate.heureka.cz — statistiky a žádost o výplatu od 1 000 Kč.",
    payoutTo: "Účet, který zadáte v Heureka Affiliate. Fakturu vystaví oni, peníze do 14 dnů.",
    signupUrl: "https://affiliate.heureka.cz/register",
    signupLabel: "Založit Heureka Affiliate (CZ)",
    envVars: ["AFFILIATE_HEUREKA_CZ_POSITION_ID"],
    priority: 1,
  },
  {
    id: "heureka-sk",
    title: "Heureka Affiliate (Slovensko)",
    whatEarns: "Stejný model pro /sk — Heureka.sk.",
    whereYouSeeMoney: "https://affiliate.heurekashopping.sk — statistiky a výplaty.",
    payoutTo: "Účet zadaný ve slovenské administraci Heureka Affiliate.",
    signupUrl: "https://affiliate.heurekashopping.sk/register",
    signupLabel: "Založit Heureka Affiliate (SK)",
    envVars: ["AFFILIATE_HEUREKA_SK_POSITION_ID"],
    priority: 2,
  },
  {
    id: "amazon",
    title: "Amazon Associates",
    whatEarns: "Nákupy po prokliku z DE/FR/IT/ES/PL/UK/US/JP (magnesium, D3, sleep tracker, omega).",
    whereYouSeeMoney: "Associates Central → Reports / Earnings. Výplata podle země účtu (banka nebo Amazon dárkový kredit).",
    payoutTo: "Amazon vám pošle provizi na účet/metodu zadanou v Associates. Nejde to do Stripe.",
    signupUrl: "https://affiliate-program.amazon.com/",
    signupLabel: "Založit Amazon Associates (US + OneLink)",
    envVars: [
      "AFFILIATE_AMAZON_TAG",
      "AFFILIATE_AMAZON_TAG_US",
      "AFFILIATE_AMAZON_TAG_UK",
      "AFFILIATE_AMAZON_TAG_DE",
      "AFFILIATE_AMAZON_TAG_FR",
      "AFFILIATE_AMAZON_TAG_IT",
      "AFFILIATE_AMAZON_TAG_ES",
      "AFFILIATE_AMAZON_TAG_PL",
      "AFFILIATE_AMAZON_TAG_JP",
    ],
    priority: 1,
  },
  {
    id: "adsense",
    title: "Google AdSense (volitelné)",
    whatEarns: "Zbytkové display sloty po souhlasu s cookies. Bez ID se sloty mění na vlastní inzerci.",
    whereYouSeeMoney: "https://www.google.com/adsense — přehled a platby.",
    payoutTo: "Účet v AdSense (minimum výplaty dle Google).",
    signupUrl: "https://www.google.com/adsense/",
    signupLabel: "Otevřít AdSense",
    envVars: ["NEXT_PUBLIC_ADSENSE_CLIENT_ID", "NEXT_PUBLIC_ADS_ENABLED"],
    priority: 3,
  },
  {
    id: "b2b",
    title: "Vlastní inzerce (B2B)",
    whatEarns: "Banner od 5 000 Kč/měsíc, sponzorovaný článek od 15 000 Kč, mention v briefu.",
    whereYouSeeMoney: "Faktura, kterou vystavíte inzerentovi. Formulář je /inzerce/formular.",
    payoutTo: "Firemní účet Al Synaptica Research Institute s.r.o. — žádný affiliate účet.",
    signupUrl: "https://medscopeglobal.com/inzerce",
    signupLabel: "Otevřít mediakit",
    envVars: [],
    priority: 1,
  },
];

export const AMAZON_STORE_SIGNUPS = [
  { market: "US + OneLink", href: "https://affiliate-program.amazon.com/", env: "AFFILIATE_AMAZON_TAG_US" },
  { market: "Německo", href: "https://partnernet.amazon.de/", env: "AFFILIATE_AMAZON_TAG_DE" },
  { market: "Británie", href: "https://affiliate-program.amazon.co.uk/", env: "AFFILIATE_AMAZON_TAG_UK" },
  { market: "Francie", href: "https://partenaires.amazon.fr/", env: "AFFILIATE_AMAZON_TAG_FR" },
  { market: "Itálie", href: "https://programma-affiliazione.amazon.it/", env: "AFFILIATE_AMAZON_TAG_IT" },
  { market: "Španělsko", href: "https://afiliados.amazon.es/", env: "AFFILIATE_AMAZON_TAG_ES" },
  { market: "Polsko", href: "https://affiliate-program.amazon.pl/", env: "AFFILIATE_AMAZON_TAG_PL" },
  { market: "Japonsko", href: "https://affiliate.amazon.co.jp/", env: "AFFILIATE_AMAZON_TAG_JP" },
] as const;

export const HEUREKA_DOCS = {
  program: "https://heureka.group/cs/affiliate-program",
  registerCz: "https://affiliate.heureka.cz/register",
  registerSk: "https://affiliate.heurekashopping.sk/register",
} as const;

function envOn(name: string): boolean {
  const raw = (process.env[name] ?? "").trim();
  return raw.length > 0 && !/^(false|0|off)$/i.test(raw);
}

export type PayoutReadiness = {
  stripe: boolean;
  heurekaCz: boolean;
  heurekaSk: boolean;
  amazonAny: boolean;
  amazonStores: Record<string, boolean>;
  adsense: boolean;
  ga: boolean;
};

export function getPayoutReadiness(): PayoutReadiness {
  const amazonStores: Record<string, boolean> = {
    fallback: envOn("AFFILIATE_AMAZON_TAG"),
    us: envOn("AFFILIATE_AMAZON_TAG_US"),
    uk: envOn("AFFILIATE_AMAZON_TAG_UK"),
    de: envOn("AFFILIATE_AMAZON_TAG_DE"),
    fr: envOn("AFFILIATE_AMAZON_TAG_FR"),
    it: envOn("AFFILIATE_AMAZON_TAG_IT"),
    es: envOn("AFFILIATE_AMAZON_TAG_ES"),
    pl: envOn("AFFILIATE_AMAZON_TAG_PL"),
    jp: envOn("AFFILIATE_AMAZON_TAG_JP"),
  };
  return {
    stripe: envOn("STRIPE_SECRET_KEY") && envOn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    heurekaCz:
      envOn("AFFILIATE_HEUREKA_CZ_POSITION_ID") ||
      envOn("AFFILIATE_HEUREKA_CZ_TEMPLATE") ||
      Boolean(DEFAULT_HEUREKA_CZ_HAFF),
    heurekaSk: envOn("AFFILIATE_HEUREKA_SK_POSITION_ID") || envOn("AFFILIATE_HEUREKA_SK_TEMPLATE"),
    amazonAny: Object.values(amazonStores).some(Boolean),
    amazonStores,
    adsense: envOn("NEXT_PUBLIC_ADSENSE_CLIENT_ID") && envOn("NEXT_PUBLIC_ADS_ENABLED"),
    ga: envOn("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
  };
}

export function channelReady(id: PayoutChannelId, readiness: PayoutReadiness): boolean | "n/a" {
  if (id === "stripe") return readiness.stripe;
  if (id === "heureka-cz") return readiness.heurekaCz;
  if (id === "heureka-sk") return readiness.heurekaSk;
  if (id === "amazon") return readiness.amazonAny;
  if (id === "adsense") return readiness.adsense;
  if (id === "b2b") return "n/a";
  return false;
}
