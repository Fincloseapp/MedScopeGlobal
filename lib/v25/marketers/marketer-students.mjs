/**
 * v25.2 — StudentMarketer: přípravné kurzy, učebnice, modely, e-learning
 */
import { appendLog } from "../shared.mjs";
import { runMarketer, discoverPartners } from "./marketer-base.mjs";

const MARKETER_ID = "students";
const SEGMENT = "students";

const DEFAULT_PARTNERS = [
  { id: "medstart", name: "Medstart", category: "prep-courses", url: "https://www.medstart.cz", commission_pct: 10, relevance: 90, traffic_potential: 70 },
  { id: "medicalbooks", name: "Medical Books", category: "textbooks", url: "https://www.medicalbooks.cz", commission_pct: 7, relevance: 85, traffic_potential: 65 },
  { id: "3b-scientific", name: "3B Scientific", category: "anatomical-models", url: "https://www.3bscientific.com", commission_pct: 5, relevance: 75, traffic_potential: 55 },
  { id: "cortexio", name: "Cortexio", category: "e-learning", url: "https://www.cortexio.cz", commission_pct: 12, relevance: 88, traffic_potential: 72 },
  { id: "anatomie-online", name: "Anatomie Online", category: "e-learning", url: "https://anatomie-online.cz", commission_pct: 8, relevance: 80, traffic_potential: 60 },
];

const TOPICS = ["anatomie", "fyziologie", "biochemie", "patologie", "farmakologie", "příprava-na-přijímačky"];
const ANGLES = [
  "přípravný kurz pro budoucí mediky",
  "učebnice doporučené studenty medicíny",
  "anatomický model pro domácí studium",
  "e-learning platforma pro mediky",
];

export async function runStudentMarketer() {
  appendLog("v25-marketers.log", "StudentMarketer start");

  await discoverPartners(null, DEFAULT_PARTNERS);

  const result = await runMarketer({
    marketerId: MARKETER_ID,
    segment: SEGMENT,
    partnerFilter: (p) => ["prep-courses", "textbooks", "anatomical-models", "e-learning"].includes(p.category),
    topics: TOPICS,
    angles: ANGLES,
  });

  appendLog("v25-marketers.log", `StudentMarketer done: ${result.proposals} proposals`);
  return result;
}
