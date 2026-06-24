export type SourceRegion = "cz" | "sk" | "eu" | "global";

export type SourceType =
  | "medical-society"
  | "university"
  | "regulator"
  | "public-health"
  | "journal"
  | "database";

export interface MedicalSource {
  id: string;
  name: string;
  url: string;
  region: SourceRegion;
  type: SourceType;
  country: string;
  specialties: string[];
}

export const medicalSources: MedicalSource[] = [
  { id: "cls-jep", name: "Česká lékařská společnost Jana Evangelisty Purkyně", url: "https://www.cls.cz", region: "cz", type: "medical-society", country: "Česko", specialties: ["Všeobecné lékařství", "Interní medicína"] },
  { id: "lf1-uk", name: "1. lékařská fakulta Univerzity Karlovy", url: "https://www.lf1.cuni.cz", region: "cz", type: "university", country: "Česko", specialties: ["Klinický výzkum", "Interní medicína"] },
  { id: "lf2-uk", name: "2. lékařská fakulta Univerzity Karlovy", url: "https://www.lf2.cuni.cz", region: "cz", type: "university", country: "Česko", specialties: ["Neurologie", "Klinický výzkum"] },
  { id: "lf3-uk", name: "3. lékařská fakulta Univerzity Karlovy", url: "https://www.lf3.cuni.cz", region: "cz", type: "university", country: "Česko", specialties: ["Praktický lékař", "Všeobecné lékařství"] },
  { id: "lf-mu", name: "Lékařská fakulta Masarykovy univerzity", url: "https://www.med.muni.cz", region: "cz", type: "university", country: "Česko", specialties: ["Klinický výzkum", "Onkologie"] },
  { id: "lf-upol", name: "Lékařská fakulta Univerzity Palackého", url: "https://www.lf.upol.cz", region: "cz", type: "university", country: "Česko", specialties: ["Interní medicína", "Neurologie"] },
  { id: "sukl", name: "Státní ústav pro kontrolu léčiv (SÚKL)", url: "https://www.sukl.cz", region: "cz", type: "regulator", country: "Česko", specialties: ["Všeobecné lékařství", "Praktický lékař"] },
  { id: "uzis", name: "Ústav zdravotnických informací a statistiky (ÚZIS)", url: "https://www.uzis.cz", region: "cz", type: "public-health", country: "Česko", specialties: ["Všeobecné lékařství", "Klinický výzkum"] },
  { id: "cas-lek-ces", name: "Časopis lékařů českých", url: "https://www.casopis.lekar.cz", region: "cz", type: "journal", country: "Česko", specialties: ["Interní medicína", "Praktický lékař"] },
  { id: "vnitni-lekarstvi", name: "Vnitřní lékařství", url: "https://www.vnitrilekarstvi.cz", region: "cz", type: "journal", country: "Česko", specialties: ["Interní medicína", "Gastroenterologie"] },
  { id: "pubmed", name: "PubMed / NCBI", url: "https://pubmed.ncbi.nlm.nih.gov", region: "global", type: "database", country: "USA", specialties: ["Klinický výzkum"] },
  { id: "who", name: "World Health Organization", url: "https://www.who.int", region: "global", type: "public-health", country: "Globální", specialties: ["Všeobecné lékařství", "Praktický lékař"] },
  { id: "esc", name: "European Society of Cardiology (ESC)", url: "https://www.escardio.org", region: "eu", type: "medical-society", country: "Evropa", specialties: ["Kardiologie"] },
  { id: "eular", name: "European Alliance of Associations for Rheumatology (EULAR)", url: "https://www.eular.org", region: "eu", type: "medical-society", country: "Evropa", specialties: ["Revmatologie"] },
  { id: "nejm", name: "The New England Journal of Medicine", url: "https://www.nejm.org", region: "global", type: "journal", country: "USA", specialties: ["Klinický výzkum", "Interní medicína"] },
  { id: "lancet", name: "The Lancet", url: "https://www.thelancet.com", region: "global", type: "journal", country: "Globální", specialties: ["Klinický výzkum", "Onkologie"] },
  { id: "bmj", name: "The BMJ", url: "https://www.bmj.com", region: "global", type: "journal", country: "Globální", specialties: ["Praktický lékař", "Všeobecné lékařství"] }
];

export function getSourcesBySpecialization(specialization: string): MedicalSource[] {
  return medicalSources.filter((source) => source.specialties.includes(specialization) || source.specialties.includes("Klinický výzkum"));
}

export function getSourceById(id: string): MedicalSource | undefined {
  return medicalSources.find((source) => source.id === id);
}
