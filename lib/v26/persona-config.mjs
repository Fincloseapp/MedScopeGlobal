/**
 * v26.1 — topic-weighted editorial persona rotation.
 * Override via EDITORIAL_PERSONA_CONFIG JSON path or inline env (optional).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTHOR_PERSONAS } from "./personas.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");

/** Default weights per public topic — higher = more likely pick. */
export const TOPIC_PERSONA_WEIGHTS = {
  "zivotni-styl": {
    empatik: 1.5,
    popularizátor: 1.4,
    vypravěč: 1.3,
    reportér: 1.0,
  },
  nemoci: {
    analytik: 1.5,
    komentátor: 1.4,
    investigativní: 1.3,
    reportér: 1.1,
  },
  prevence: {
    analytik: 1.4,
    empatik: 1.3,
    popularizátor: 1.2,
    reportér: 1.1,
  },
  rozhovory: {
    reportér: 1.6,
    komentátor: 1.4,
    vypravěč: 1.3,
    popularizátor: 1.1,
  },
  dlouhovekost: {
    analytik: 1.5,
    popularizátor: 1.4,
    empatik: 1.3,
    vypravěč: 1.2,
    komentátor: 1.1,
  },
};

function loadConfigOverride() {
  const envPath = process.env.EDITORIAL_PERSONA_CONFIG?.trim();
  const candidates = [
    envPath,
    join(ROOT, "config", "editorial-personas.json"),
    join(ROOT, "data", "editorial-personas.json"),
  ].filter(Boolean);

  for (const p of candidates) {
    if (!existsSync(p)) continue;
    try {
      const parsed = JSON.parse(readFileSync(p, "utf8"));
      if (parsed?.topicWeights) return parsed.topicWeights;
    } catch {
      /* ignore bad config */
    }
  }
  return null;
}

let cachedOverride = null;
let cachedOverrideAt = 0;

function getTopicWeights() {
  const now = Date.now();
  if (cachedOverride && now - cachedOverrideAt < 60_000) {
    return { ...TOPIC_PERSONA_WEIGHTS, ...cachedOverride };
  }
  const override = loadConfigOverride();
  cachedOverride = override;
  cachedOverrideAt = now;
  return override ? { ...TOPIC_PERSONA_WEIGHTS, ...override } : TOPIC_PERSONA_WEIGHTS;
}

/** Build weighted persona pool for a topic (default weight 1.0). */
export function getPersonasForTopic(topic) {
  const weights = getTopicWeights()[topic] ?? {};
  return AUTHOR_PERSONAS.map((persona) => ({
    persona,
    weight: Math.max(0.1, Number(weights[persona.id] ?? 1)),
  }));
}

export function listTopicPersonaConfig() {
  return getTopicWeights();
}
