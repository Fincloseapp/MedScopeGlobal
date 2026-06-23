/** Marketingová copy a value proposition — v23 */
export const V23_VALUE_PROPOSITION = {
  eyebrow: "Evidence-based medicína v češtině",
  title: "Odborný zdravotnický magazín pro praxi, výzkum a studium",
  subtitle:
    "Studie, legislativa, léky a digitální zdravotnictví — strukturované shrnutí, klinický dopad a ověřené zdroje pro lékaře, studenty LF a odbornou veřejnost.",
  trustPoints: [
    "PubMed · SÚKL · EMA · WHO",
    "České odborné shrnutí",
    "Klinický dopad u každé studie",
    "GDPR a transparentní citace",
  ],
} as const;

export const V23_AUDIENCE_PRIORITIES = [
  {
    id: "lekar",
    title: "Lékař v praxi",
    description: "Guidelines, studie, legislativa a lékové novinky pro každodenní rozhodování.",
    href: "/odborna",
    cta: "Pro kliniky",
    topics: ["Studie", "Léky", "Legislativa"],
  },
  {
    id: "student",
    title: "Student medicíny",
    description: "Anatomie, fyziologie, kvízy, přijímačky a studijní plány 1.–6. ročník.",
    href: "/studium",
    cta: "Studium medicíny",
    topics: ["Kvízy", "Přijímačky", "Obory"],
  },
  {
    id: "vedec",
    title: "Vědec a výzkum",
    description: "RCT, meta-analýzy, univerzitní novinky a digitální zdravotnictví.",
    href: "/pro-koho/vedec",
    cta: "Výzkumná sekce",
    topics: ["Studie", "Novinky", "eHealth"],
  },
  {
    id: "laik",
    title: "Laik a prevence",
    description: "Srozumitelné výklady, prevence a orientace ve zdravotnictví.",
    href: "/verejnost",
    cta: "Pro veřejnost",
    topics: ["Prevence", "Články", "Newsletter"],
  },
] as const;

export const V23_EDITORIAL_PILLARS = [
  { label: "Studie", href: "/studie", desc: "RCT, meta-analýzy, CZ souhrn" },
  { label: "Léky", href: "/leky", desc: "EMA, FDA, SÚKL" },
  { label: "Legislativa", href: "/legislativa", desc: "MZČR, úhrady, DRG" },
  { label: "Digitální zdravotnictví", href: "/digital-health", desc: "eHealth, AI, telemedicína" },
  { label: "Newsletter", href: "/newsletter", desc: "2× měsíčně odborně" },
] as const;
