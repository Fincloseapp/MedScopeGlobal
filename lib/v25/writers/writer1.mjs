/**
 * Writer 1 — Životní styl (spánek, pohyb, výživa, stres)
 */
import { generatePublicArticle, PUBLIC_TOPICS, pickRotatedSeeds } from "./writer-base.mjs";

export const WRITER_ID = "writer1";
export const WRITER_NAME = "Redakce životního stylu";
export const TOPIC = "zivotni-styl";
export const TOPIC_LABEL = PUBLIC_TOPICS[TOPIC];

export const SEEDS = [
  { seed: "Zdravý spánek v zimním období", angle: "praktické tipy pro domácnost" },
  { seed: "Pohyb pro zaneprázdněné rodiče", angle: "10 minut denně bez posilovny" },
  { seed: "Vyvážená strava bez extrémů", angle: "středomořský talíř v české kuchyni" },
  { seed: "Stres z práce a jeho vliv na imunitu", angle: "dechová cvičení a režim dne" },
  { seed: "Hydratace a energie v chladném počasí", angle: "mýty o pitném režimu" },
  { seed: "Digitální detox a duševní pohoda", angle: "realistické kroky bez radikálních změn" },
  { seed: "Sezónní únava — co pomáhá a co je normální", angle: "spánek, světlo, pohyb" },
];

export async function runWriter1(options = {}) {
  const limit = options.limit ?? 1;
  const writerIndex = options.writerIndex ?? 0;
  const recentArticles = options.recentArticles ?? null;
  const batchArticles = options.batchArticles ?? [];
  const results = [];
  for (const item of pickRotatedSeeds(SEEDS, limit, writerIndex)) {
    const article = await generatePublicArticle({
      topic: TOPIC,
      topicLabel: TOPIC_LABEL,
      seed: item.seed,
      writerName: WRITER_NAME,
      angle: item.angle,
      writerIndex,
      recentArticles,
      batchArticles,
    });
    batchArticles.push({ title: article.title, excerpt: article.excerpt });
    results.push(article);
  }
  return results;
}
