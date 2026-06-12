/**
 * Writer 1 — Životní styl (spánek, pohyb, výživa, stres)
 */
import { generatePublicArticle, PUBLIC_TOPICS } from "./writer-base.mjs";

export const WRITER_ID = "writer1";
export const WRITER_NAME = "Redakce životního stylu";
export const TOPIC = "zivotni-styl";
export const TOPIC_LABEL = PUBLIC_TOPICS[TOPIC];

export const SEEDS = [
  { seed: "Zdravý spánek v zimním období", angle: "praktické tipy pro domácnost" },
  { seed: "Pohyb pro zaneprázdněné rodiče", angle: "10 minut denně bez posilovny" },
  { seed: "Vyvážená strava bez extrémů", angle: "středomořský talíř v české kuchyni" },
  { seed: "Stres z práce a jeho vliv na imunitu", angle: "dechová cvičení a režim dne" },
];

export async function runWriter1(options = {}) {
  const limit = options.limit ?? 1;
  const results = [];
  for (const item of SEEDS.slice(0, limit)) {
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
