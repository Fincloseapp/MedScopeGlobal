/** Shared load-test configuration for AI Engine v18. */
export const BASE_URL =
  process.env.V18_LOAD_BASE_URL?.replace(/\/$/, "") ||
  "https://www.medscopeglobal.com";

export const PHASES = {
  rampUpSec: 30,
  steadySec: 60,
  rampDownSec: 20,
  maxRps: Number(process.env.V18_LOAD_MAX_RPS || 50),
};

export const TOTAL_DURATION_SEC =
  PHASES.rampUpSec + PHASES.steadySec + PHASES.rampDownSec;

/** Target RPS at elapsed seconds from test start. */
export function targetRpsAt(elapsedSec) {
  const { rampUpSec, steadySec, rampDownSec, maxRps } = PHASES;
  if (elapsedSec <= 0) return 0;
  if (elapsedSec < rampUpSec) return (elapsedSec / rampUpSec) * maxRps;
  if (elapsedSec < rampUpSec + steadySec) return maxRps;
  const downElapsed = elapsedSec - rampUpSec - steadySec;
  if (downElapsed < rampDownSec) {
    return maxRps * (1 - downElapsed / rampDownSec);
  }
  return 0;
}

export const THRESHOLDS = {
  summarize: { status: 200, p95Ms: 500 },
  guideline: { status: 200, p95Ms: 700 },
  "clinical-check": { status: 200, p95Ms: 800 },
  upload: { status: 200, p95Ms: 1500 },
  mixed: { errorRatePct: 2 },
};

export const PAYLOADS = {
  summarize: {
    query: "Pacient má bolesti hlavy. Shrň stručně.",
    userId: "load-v18-summarize",
  },
  guideline: {
    query: "Doporučení při horečce 38,5 °C u dospělého bez komorbidit.",
    userId: "load-v18-guideline",
  },
  "clinical-check": {
    query: "Vyhodnoť klinická rizika: horečka, tachykardie, hypotenze.",
    userId: "load-v18-clinical",
  },
};
