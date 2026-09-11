import type { ListingKind } from "@/lib/exchange/types";

export type ExchangeCategory = {
  slug: string;
  kind: ListingKind | "any";
  labels: Record<string, string>;
};

export const EXCHANGE_CATEGORIES: ExchangeCategory[] = [
  { slug: "diagnostics", kind: "product", labels: { cs: "Diagnostika", en: "Diagnostics", de: "Diagnostik", fr: "Diagnostics", it: "Diagnostica", es: "Diagnóstico", sk: "Diagnostika", pl: "Diagnostyka", hu: "Diagnosztika" } },
  { slug: "imaging", kind: "product", labels: { cs: "Zobrazovací technika", en: "Imaging", de: "Bildgebung", fr: "Imagerie", it: "Imaging", es: "Imagen", sk: "Zobrazovanie", pl: "Obrazowanie", hu: "Képalkotás" } },
  { slug: "lab-equipment", kind: "product", labels: { cs: "Laboratorní vybavení", en: "Lab equipment", de: "Laborausstattung", fr: "Équipement de labo", it: "Attrezzature di laboratorio", es: "Equipos de laboratorio", sk: "Laboratórne vybavenie", pl: "Sprzęt laboratoryjny", hu: "Laboratóriumi eszközök" } },
  { slug: "digital-health", kind: "product", labels: { cs: "Digitální zdraví", en: "Digital health", de: "Digitale Gesundheit", fr: "Santé numérique", it: "Salute digitale", es: "Salud digital", sk: "Digitálne zdravie", pl: "Zdrowie cyfrowe", hu: "Digitális egészség" } },
  { slug: "consumables", kind: "product", labels: { cs: "Spotřební materiál", en: "Consumables", de: "Verbrauchsmaterial", fr: "Consommables", it: "Materiale di consumo", es: "Fungibles", sk: "Spotrebný materiál", pl: "Materiały eksploatacyjne", hu: "Fogyóeszközök" } },
  { slug: "clinical-trials", kind: "service", labels: { cs: "Klinické studie", en: "Clinical trials", de: "Klinische Studien", fr: "Essais cliniques", it: "Studi clinici", es: "Ensayos clínicos", sk: "Klinické štúdie", pl: "Badania kliniczne", hu: "Klinikai vizsgálatok" } },
  { slug: "lab-analysis", kind: "service", labels: { cs: "Laboratorní analýzy", en: "Laboratory analysis", de: "Laboranalysen", fr: "Analyses de laboratoire", it: "Analisi di laboratorio", es: "Análisis de laboratorio", sk: "Laboratórne analýzy", pl: "Analizy laboratoryjne", hu: "Laboratóriumi elemzések" } },
  { slug: "consulting", kind: "service", labels: { cs: "Konzultace", en: "Consulting", de: "Beratung", fr: "Conseil", it: "Consulenza", es: "Consultoría", sk: "Konzultácie", pl: "Doradztwo", hu: "Tanácsadás" } },
  { slug: "regulatory", kind: "service", labels: { cs: "Legislativa a compliance", en: "Regulatory & compliance", de: "Regulatorik & Compliance", fr: "Réglementation", it: "Normativa e compliance", es: "Regulación y compliance", sk: "Legislatíva a compliance", pl: "Regulacje i compliance", hu: "Jogszabályi megfelelés" } },
  { slug: "telemedicine", kind: "service", labels: { cs: "Telemedicína", en: "Telemedicine", de: "Telemedizin", fr: "Télémédecine", it: "Telemedicina", es: "Telemedicina", sk: "Telemedicína", pl: "Telemedycyna", hu: "Telemedicina" } },
  { slug: "training", kind: "service", labels: { cs: "Školení", en: "Training", de: "Schulung", fr: "Formation", it: "Formazione", es: "Formación", sk: "Školenia", pl: "Szkolenia", hu: "Képzés" } },
  { slug: "procurement", kind: "demand", labels: { cs: "Poptávka vybavení", en: "Equipment RFP", de: "Gerätebedarf", fr: "Appel d’offres équipement", it: "Richiesta attrezzature", es: "Demanda de equipos", sk: "Dopyt vybavenia", pl: "Zapytanie o sprzęt", hu: "Eszközbeszerzés" } },
  { slug: "partnership", kind: "demand", labels: { cs: "Partnerství a výzkum", en: "Partnership & research", de: "Partnerschaft & Forschung", fr: "Partenariat et recherche", it: "Partnership e ricerca", es: "Asociación e investigación", sk: "Partnerstvo a výskum", pl: "Partnerstwo i badania", hu: "Partnerség és kutatás" } },
];

export function categoriesForKind(kind?: ListingKind | "any") {
  if (!kind || kind === "any") return EXCHANGE_CATEGORIES;
  return EXCHANGE_CATEGORIES.filter((item) => item.kind === kind || item.kind === "any");
}

export function categoryLabel(slug: string, locale = "en"): string {
  const row = EXCHANGE_CATEGORIES.find((item) => item.slug === slug);
  if (!row) return slug;
  const key = locale.split("-")[0] ?? "en";
  return row.labels[key] ?? row.labels.en ?? slug;
}

export function isKnownCategory(slug: string, kind?: ListingKind): boolean {
  return EXCHANGE_CATEGORIES.some((item) => item.slug === slug && (!kind || item.kind === kind || item.kind === "any"));
}
