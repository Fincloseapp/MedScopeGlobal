/** Transparent B2B ceník — /firmy, /firmy/cenik */

export type V271B2BTier = {
  id: string;
  name: string;
  priceLabel: string;
  priceNote?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaHref: string;
  ctaLabel: string;
};

export const V271_B2B_PRICING: V271B2BTier[] = [
  {
    id: "banner",
    name: "Banner",
    priceLabel: "5 000 Kč",
    priceNote: "měsíčně",
    description: "Viditelnost u cílené lékařské a studentské audience.",
    features: [
      "Rotace banneru v magazínu a odborné sekci",
      "Segmentace: lékaři / studenti / veřejnost",
      "Měsíční report zobrazení a kliknutí",
    ],
    ctaHref: "/inzerce/formular",
    ctaLabel: "Objednat banner",
  },
  {
    id: "sponsored",
    name: "Sponzorovaný článek",
    priceLabel: "15 000 Kč",
    priceNote: "za publikaci",
    description: "Editoriálně zpracovaný odborný obsah s jasným označením partnera.",
    features: [
      "Redakční zpracování a fact-check",
      "Označení „Sponzorováno“ dle etických standardů",
      "Distribuce v newsletteru a sociálních kanálech",
      "DOI/PMID odkazy na primární zdroje",
    ],
    highlighted: true,
    ctaHref: "/inzerce/formular",
    ctaLabel: "Poptat článek",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Individuálně",
    priceNote: "roční smlouva",
    description: "Pharma, nemocnice a univerzity — white-label, API a kampaně na míru.",
    features: [
      "Multi-kanálové kampaně (banner + články + newsletter)",
      "White-label Academy moduly",
      "Dedikovaný account manager",
      "SLA a compliance reporting (SÚKL, ČLK)",
    ],
    ctaHref: "/inzerce/formular",
    ctaLabel: "Kontaktovat obchod",
  },
];

export const V271_B2B_PRICING_NOTE =
  "Uvedené ceny jsou orientační bez DPH. Finální nabídku připravíme do 2 pracovních dnů.";
