/**
 * Writer 5 — Dlouhověkost (healthspan, longevity, biomarkery, prevence stárnutí)
 */
import {
  generatePublicArticle,
  PUBLIC_TOPICS,
  pickRotatedSeeds,
  getEnrichedWriterSeeds,
} from "./writer-base.mjs";
import { LONGEVITY_SEEDS } from "../../v26/topic-calendar.mjs";

export const WRITER_ID = "writer5";
export const WRITER_NAME = "Redakce dlouhověkosti";
/** Internal topic key — persisted as zivotni-styl with content_pillar metadata */
export const TOPIC = "dlouhovekost";
export const TOPIC_LABEL = "Dlouhověkost";
export const DB_PUBLIC_TOPIC = "zivotni-styl";
export const CONTENT_PILLAR = "dlouhovekost";

export const SEEDS = LONGEVITY_SEEDS;

export async function runWriter5(options = {}) {
  const limit = options.limit ?? 1;
  const writerIndex = options.writerIndex ?? 4;
  const recentArticles = options.recentArticles ?? null;
  const batchArticles = options.batchArticles ?? [];
  const results = [];
  const seeds = getEnrichedWriterSeeds(SEEDS, TOPIC, writerIndex);
  for (const item of pickRotatedSeeds(seeds, limit, writerIndex)) {
    const article = await generatePublicArticle({
      topic: TOPIC,
      topicLabel: TOPIC_LABEL,
      dbPublicTopic: DB_PUBLIC_TOPIC,
      contentPillar: CONTENT_PILLAR,
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
