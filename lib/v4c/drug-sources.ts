export type DrugSource = {
  id: string;
  agency: string;
  labelCs: string;
  descriptionCs?: string;
  url?: string;
};

const DRUG_SOURCES: DrugSource[] = [
  {
    id: "ema-whats-new",
    agency: "ema",
    labelCs: "EMA — Co je nového",
    descriptionCs: "Novinky z Evropské agentury pro léčivé přípravky.",
    url: "https://www.ema.europa.eu/",
  },
  {
    id: "sukl",
    agency: "sukl",
    labelCs: "SÚKL",
    descriptionCs: "Státní ústav pro kontrolu léčiv.",
    url: "https://www.sukl.cz/",
  },
  {
    id: "fda",
    agency: "fda",
    labelCs: "FDA",
    descriptionCs: "U.S. Food and Drug Administration.",
    url: "https://www.fda.gov/",
  },
];

export function getDrugSourceById(id: string): DrugSource | undefined {
  return DRUG_SOURCES.find((source) => source.id === id);
}

export function listDrugSources(): DrugSource[] {
  return DRUG_SOURCES;
}
