/**
 * Writer 5 desk — Dlouhověkost. Four senior specialists via run-public-writers.
 */
import { runCategoryWriter } from "./run-category-writer.mjs";
import { LONGEVITY_SEEDS } from "../../v26/topic-calendar.mjs";

export const WRITER_ID = "writer5";
export const WRITER_NAME = "Redakce dlouhověkosti";
export const TOPIC = "dlouhovekost";
export const TOPIC_LABEL = "Dlouhověkost";
export const DB_PUBLIC_TOPIC = "zivotni-styl";
export const CONTENT_PILLAR = "dlouhovekost";

export const SEEDS = LONGEVITY_SEEDS;

export async function runWriter5(options = {}) {
  return runCategoryWriter({
    deskId: WRITER_ID,
    topic: TOPIC,
    topicLabel: TOPIC_LABEL,
    seeds: SEEDS,
    writerName: WRITER_NAME,
    defaultWriterIndex: 16,
    dbPublicTopic: DB_PUBLIC_TOPIC,
    contentPillar: CONTENT_PILLAR,
    options,
  });
}
