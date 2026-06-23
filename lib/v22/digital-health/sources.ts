/** Zdroje digitálního zdravotnictví — priorita CZ → EU → US → globální */
export type DhSourceTier = "cz" | "eu" | "us" | "global";

export type DhSource = {
  id: string;
  name: string;
  url: string;
  tier: DhSourceTier;
  topics: string[];
};

export const V22_DIGITAL_HEALTH_SOURCES: DhSource[] = [
  { id: "mzcr", name: "MZČR", url: "https://www.mzcr.cz/", tier: "cz", topics: ["eHealth", "telemedicína", "legislativa"] },
  { id: "szu", name: "SZÚ", url: "https://szu.cz/", tier: "cz", topics: ["epidemiologie", "digital health"] },
  { id: "uzis", name: "ÚZIS", url: "https://www.uzis.cz/", tier: "cz", topics: ["registry", "NZIS", "data"] },
  { id: "ezdravi", name: "eZdraví", url: "https://www.ezdravi.gov.cz/", tier: "cz", topics: ["eHealth", "portál pacienta", "NZIS"] },
  { id: "sukl", name: "SÚKL", url: "https://www.sukl.cz/", tier: "cz", topics: ["SW jako ZP", "AI", "regulace"] },
  { id: "zdravotnicky-denik", name: "Zdravotnický deník", url: "https://www.zdravotnickydenik.cz/", tier: "cz", topics: ["novinky", "digitalizace"] },
  { id: "ema", name: "EMA", url: "https://www.ema.europa.eu/", tier: "eu", topics: ["SaMD", "AI", "regulace"] },
  { id: "ecdc", name: "ECDC", url: "https://www.ecdc.europa.eu/", tier: "eu", topics: ["epidemiologie", "data"] },
  { id: "eu-ehealth", name: "EU eHealth", url: "https://digital-strategy.ec.europa.eu/", tier: "eu", topics: ["AI Act", "interoperabilita"] },
  { id: "nih", name: "NIH", url: "https://www.nih.gov/", tier: "us", topics: ["výzkum", "AI", "telemedicína"] },
  { id: "cdc", name: "CDC", url: "https://www.cdc.gov/", tier: "us", topics: ["veřejné zdraví", "data"] },
  { id: "mayo", name: "Mayo Clinic", url: "https://www.mayoclinic.org/", tier: "us", topics: ["klinická praxe", "digital health"] },
  { id: "who", name: "WHO", url: "https://www.who.int/", tier: "global", topics: ["eHealth", "strategie", "AI"] },
  { id: "lancet", name: "The Lancet Digital Health", url: "https://www.thelancet.com/journals/landig/home", tier: "global", topics: ["výzkum", "evidence"] },
];

export const TIER_LABELS: Record<DhSourceTier, string> = {
  cz: "České zdroje",
  eu: "Evropské zdroje",
  us: "Americké zdroje",
  global: "Globální zdroje",
};
