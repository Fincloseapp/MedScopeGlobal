/**
 * v25.2 — ProMarketer: konference, časopisy, vybavení, B2B
 */
import { appendLog } from "../shared.mjs";
import { runMarketer, discoverPartners } from "./marketer-base.mjs";

const MARKETER_ID = "pro";
const SEGMENT = "pro";

const DEFAULT_PARTNERS = [
  { id: "congress-prague", name: "Česká společnost lékařská", category: "conferences", url: "https://www.jachymov.cz", commission_pct: 3, relevance: 85, traffic_potential: 60 },
  { id: "cas-lek-ces", name: "Časopis Lékař a technika", category: "journals", url: "https://www.clt.cz", commission_pct: 2, relevance: 70, traffic_potential: 45 },
  { id: "chirana", name: "Chirana Medical", category: "equipment", url: "https://www.chirana.com", commission_pct: 4, relevance: 75, traffic_potential: 50 },
  { id: "medicalc", name: "Medicalc", category: "software", url: "https://www.medicalc.cz", commission_pct: 6, relevance: 80, traffic_potential: 55 },
  { id: "roche-diagnostics", name: "Roche Diagnostics", category: "equipment", url: "https://diagnostics.roche.com", commission_pct: 3, relevance: 78, traffic_potential: 52 },
];

const TOPICS = ["conferences", "journals", "equipment", "software", "services"];
const ANGLES = [
  "blížící se odborná konference pro lékaře",
  "předplatné odborného časopisu",
  "diagnostické vybavení pro praxi",
  "B2B software pro zdravotnická zařízení",
];

export async function runProMarketer() {
  appendLog("v25-marketers.log", "ProMarketer start");

  await discoverPartners(null, DEFAULT_PARTNERS);

  const result = await runMarketer({
    marketerId: MARKETER_ID,
    segment: SEGMENT,
    partnerFilter: (p) => ["conferences", "journals", "equipment", "software", "services"].includes(p.category),
    topics: TOPICS,
    angles: ANGLES,
  });

  appendLog("v25-marketers.log", `ProMarketer done: ${result.proposals} proposals`);
  return result;
}
