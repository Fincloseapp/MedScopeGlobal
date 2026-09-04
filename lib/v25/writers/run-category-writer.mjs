import {
  generatePublicArticle,
  PUBLIC_TOPICS,
  pickRotatedSeeds,
  getEnrichedWriterSeeds,
  collectUsedWriterSeeds,
} from "./writer-base.mjs";
import { SPECIALTY_ANGLES, specialtyWriterName } from "./writer-roster.mjs";

/**
 * Run one senior specialist inside a category desk.
 */
export async function runCategoryWriter({
  deskId,
  topic,
  topicLabel = PUBLIC_TOPICS[topic],
  seeds,
  writerName,
  defaultWriterIndex = 0,
  dbPublicTopic = null,
  contentPillar = null,
  options = {},
}) {
  const specialty = options.specialty ?? "practice";
  const writerId = options.writerId ?? `${deskId}-${specialty}`;
  const writerIndex = options.writerIndex ?? defaultWriterIndex;
  const recentArticles = options.recentArticles ?? null;
  const batchArticles = options.batchArticles ?? [];
  const limit = options.limit ?? 1;
  const angleSuffix = SPECIALTY_ANGLES[specialty] ?? SPECIALTY_ANGLES.practice;
  const displayName = specialtyWriterName(writerName, specialty);

  const enriched = getEnrichedWriterSeeds(seeds, topic, writerIndex, options.date ?? new Date(), {
    includeTrends: specialty === "trends",
    includeLongevity: topic === "dlouhovekost" || topic === "zivotni-styl" || topic === "prevence",
  });

  const results = [];
  const usedSeeds = collectUsedWriterSeeds([...(recentArticles ?? []), ...(batchArticles ?? [])], {
    locale: options.locale ?? "cs",
    date: options.date ?? new Date(),
    seeds: enriched,
  });
  for (const item of pickRotatedSeeds(enriched, limit, writerIndex, options.date ?? new Date(), {
    usedSeeds,
  })) {
    const article = await generatePublicArticle({
      topic,
      topicLabel,
      dbPublicTopic,
      contentPillar,
      seed: item.seed,
      writerName: displayName,
      angle: `${item.angle}; ${angleSuffix}`,
      writerIndex,
      writerId,
      specialty,
      locale: options.locale ?? "cs",
      recentArticles,
      batchArticles,
    });
    batchArticles.push({
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      locale: article.locale,
      seed: article.seed,
      writer_seed: article.seed,
    });
    results.push(article);
  }
  return results;
}
