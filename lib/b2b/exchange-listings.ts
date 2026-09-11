/** Manufacturer catalog for /exchange — Czech / EU availability only. */

export type ExchangeListing = {
  id: string;
  region: "Česko" | "EU" | "Česko + EU";
  category: string;
  title: string;
  maker: string;
  cert: string;
  summary: string;
  href: string;
};

export const EXCHANGE_LISTINGS: ExchangeListing[] = [
  {
    id: "poc-cr-ce",
    region: "Česko + EU",
    category: "Diagnostika · POC",
    title: "CE-IVDR analyzátor pro ordinaci (imunoassay)",
    maker: "EU výrobce, distribuce ČR/SK",
    cert: "CE / IVDR",
    summary:
      "Point-of-care imunoassay pro ambulance a laboratoře v Česku a na Slovensku. Kontakty až po ověření inzerenta — bez provize z obchodu.",
    href: "/exchange#poc-cr-ce",
  },
  {
    id: "lab-panels-eu",
    region: "EU",
    category: "Laboratoř",
    title: "Imunologické panely pro EU laboratoře",
    maker: "Výrobce v EU, sklady DE/CZ",
    cert: "CE / ISO 13485",
    summary:
      "Specializované panely pro nemocniční a smluvní laboratoře v Evropské unii. Sklady DE/CZ, certifikace CE / ISO 13485.",
    href: "/exchange#lab-panels-eu",
  },
  {
    id: "telemed-b2b-cz",
    region: "Česko",
    category: "Telemedicína B2B",
    title: "Instituce–instituce: telemedicínský kanál pro české sítě",
    maker: "Dodavatel se sídlem v ČR",
    cert: "GDPR · bez péče přímo pacientovi",
    summary:
      "B2B napojení nemocnice / laboratoř / síť ambulancí. Žádná distanční péče koncovému pacientovi přes tržiště.",
    href: "/exchange#telemed-b2b-cz",
  },
];
