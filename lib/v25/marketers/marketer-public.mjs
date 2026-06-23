/**
 * v25.2 — PublicMarketer: OTC, doplňky, affiliate (Alza, Pilulka), kliniky, laborky
 */
import { appendLog } from "../shared.mjs";
import { runMarketer, discoverPartners } from "./marketer-base.mjs";

const MARKETER_ID = "public";
const SEGMENT = "public";

const DEFAULT_PARTNERS = [
  { id: "alza-zdravi", name: "Alza Zdraví", category: "otc", url: "https://www.alza.cz/zdravi", commission_pct: 4, relevance: 75, traffic_potential: 85 },
  { id: "pilulka", name: "Pilulka.cz", category: "otc", url: "https://www.pilulka.cz", commission_pct: 6, relevance: 80, traffic_potential: 80 },
  { id: "myprotein-cz", name: "MyProtein CZ", category: "supplements", url: "https://www.myprotein.cz", commission_pct: 8, relevance: 55, traffic_potential: 60 },
  { id: "synlab", name: "Synlab", category: "labs", url: "https://www.synlab.cz", commission_pct: 3, relevance: 65, traffic_potential: 55 },
  { id: "canadian-medical", name: "Canadian Medical", category: "clinics", url: "https://www.cmcpraha.cz", commission_pct: 2, relevance: 60, traffic_potential: 50 },
];

const TOPICS = ["zivotni-styl", "nemoci", "prevence", "rozhovory"];
const ANGLES = [
  "doplňky stravy pro každodenní prevenci",
  "OTC přípravky dostupné online",
  "preventivní vyšetření v partnerské laboratoři",
  "affiliate nabídka pro čtenáře MedScopeGlobal",
];

export async function runPublicMarketer() {
  appendLog("v25-marketers.log", "PublicMarketer start");

  await discoverPartners(null, DEFAULT_PARTNERS);

  const result = await runMarketer({
    marketerId: MARKETER_ID,
    segment: SEGMENT,
    partnerFilter: (p) => ["otc", "supplements", "labs", "clinics", "affiliate"].includes(p.category),
    topics: TOPICS,
    angles: ANGLES,
  });

  appendLog("v25-marketers.log", `PublicMarketer done: ${result.proposals} proposals`);
  return result;
}
