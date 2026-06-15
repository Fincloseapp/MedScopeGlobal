/** MedScope v27.1 — homepage copy and CTA wiring */
import { V27_MINI_PRODUCTS, V27_SUBSCRIPTIONS } from "@/lib/v27/config";

export const V271_HERO = {
  eyebrow: "MedScope v27.1",
  claim: "Nejmodernější zdravotnický magazín pro veřejnost, studenty a lékaře",
  subtitle:
    "Prevence a životní styl pro veřejnost, studijní nástroje pro budoucí lékaře a evidence-based obsah pro praxi — na jedné platformě.",
} as const;

export const V271_HERO_CTAS = [
  { label: "Najdi svůj problém", href: "/verejnost/temata" },
  { label: "Zeptej se AI", href: "/ai-asistent/verejnost" },
  { label: "Pro studenty", href: "/studenti" },
  { label: "Pro lékaře", href: "/lekari" },
] as const;

export const V271_AUDIENCES = [
  {
    id: "public",
    label: "Veřejnost",
    description: "Prevence, výživa, spánek, fitness a srozumitelné články.",
    topics: ["prevence", "výživa", "spánek", "fitness", "ženské zdraví", "mužské zdraví"],
    href: "/verejnost",
    ctaPrimary: { label: "Najdi svůj problém", href: "/verejnost/temata" },
    ctaSecondary: { label: "Zeptej se AI", href: "/ai-asistent/verejnost" },
  },
  {
    id: "student",
    label: "Studenti",
    description: "Anatomie, farmakologie, testy, přijímačky a AI tutor.",
    topics: ["anatomie", "farmakologie", "testy", "přijímačky", "zkoušky", "AI tutor"],
    href: "/studenti",
    ctaPrimary: { label: "Chci studovat medicínu", href: "/studenti/chci-studovat" },
    ctaSecondary: { label: "AI tutor", href: "/studenti/ai-tutor" },
  },
  {
    id: "physician",
    label: "Lékaři",
    description: "Guidelines, přehledy studií, Research Hub a klinický AI.",
    topics: ["guidelines", "CME", "studie", "diagnostika", "Research Hub"],
    href: "/lekari",
    ctaPrimary: { label: "Odborná sekce", href: "/odborna" },
    ctaSecondary: { label: "Klinický AI", href: "/lekari/ai-asistent" },
  },
] as const;

export const V271_B2B = {
  title: "Pro firmy a instituce",
  description: "Pharma, kliniky, laboratoře a univerzity — reklama, kampaně a partnerství.",
  href: "/firmy",
  cta: "B2B nabídka",
} as const;

export const V271_AKTUALNI = {
  title: "Aktuální medicína",
  description: "Zahraniční a domácí zprávy, studie a lékové novinky v češtině.",
  href: "/aktualni-zpravy",
  cta: "Číst zprávy",
  links: [
    { label: "Aktuální zprávy", href: "/aktualni-zpravy" },
    { label: "Studie", href: "/studie" },
    { label: "Léky", href: "/leky" },
    { label: "Novinky", href: "/novinky" },
  ],
} as const;

export const V271_MINI_PRODUCTS = V27_MINI_PRODUCTS;
export const V271_SUBSCRIPTIONS = V27_SUBSCRIPTIONS;
