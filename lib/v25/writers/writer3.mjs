/**
 * Writer 3 — Prevence (screening, očkování, zdravé návyky)
 */
import { generatePublicArticle, PUBLIC_TOPICS, pickRotatedSeeds } from "./writer-base.mjs";

export const WRITER_ID = "writer3";
export const WRITER_NAME = "Redakce prevence";
export const TOPIC = "prevence";
export const TOPIC_LABEL = PUBLIC_TOPICS[TOPIC];

export const SEEDS = [
  { seed: "Preventivní prohlídky u praktického lékaře", angle: "co čekat podle věku" },
  { seed: "Očkování dospělých — přehled bez mýtů", angle: "influenza, Tdap, pneumokok" },
  { seed: "Prevence kardiovaskulárních onemocnění", angle: "kouření, cholesterol, pohyb" },
  { seed: "Mentální prevence a duševní pohoda", angle: "kdy vyhledat odbornou pomoc" },
];

export async function runWriter3(options = {}) {
  const limit = options.limit ?? 1;
  const writerIndex = options.writerIndex ?? 2;
  const results = [];
  for (const item of pickRotatedSeeds(SEEDS, limit, writerIndex)) {
    const article = await generatePublicArticle({
      topic: TOPIC,
      topicLabel: TOPIC_LABEL,
      seed: item.seed,
      writerName: WRITER_NAME,
      angle: item.angle,
    });
    results.push(article);
  }
  return results;
}
