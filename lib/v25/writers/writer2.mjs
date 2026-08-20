/**
 * Writer 2 — Nemoci (diabetes, hypertenze, alergie, infekce)
 */
import { generatePublicArticle, PUBLIC_TOPICS, pickRotatedSeeds, getEnrichedWriterSeeds } from "./writer-base.mjs";

export const WRITER_ID = "writer2";
export const WRITER_NAME = "Redakce vysvětlení nemocí";
export const TOPIC = "nemoci";
export const TOPIC_LABEL = PUBLIC_TOPICS[TOPIC];

export const SEEDS = [
  { seed: "Cukrovka 2. typu — co znamená pro každodenní život", angle: "srozumitelně bez strašení" },
  { seed: "Vysoký krevní tlak: kdy jít k lékaři", angle: "domácí měření a varovné signály" },
  { seed: "Chřipka versus nachlazení — jak je rozlišit", angle: "praktický přehled pro rodiny" },
  { seed: "RSV u dětí a seniorů — kdy jde o víc než rýmu", angle: "příznaky, ochrana, kdy k lékaři" },
  { seed: "Klíště a lymská borelióza v pozdním létě", angle: "prevence, příznaky, praktický postup" },
  { seed: "Bolesti hlavy — kdy je běžná a kdy urgentní", angle: "červené a zelené signály" },
  { seed: "Žaludeční potíže po svátcích a grilování", angle: "co dělat doma a kdy k lékaři" },
];

export async function runWriter2(options = {}) {
  const limit = options.limit ?? 1;
  const writerIndex = options.writerIndex ?? 1;
  const recentArticles = options.recentArticles ?? null;
  const batchArticles = options.batchArticles ?? [];
  const results = [];
  const seeds = getEnrichedWriterSeeds(SEEDS, TOPIC, writerIndex);
  for (const item of pickRotatedSeeds(seeds, limit, writerIndex)) {
    const article = await generatePublicArticle({
      topic: TOPIC,
      topicLabel: TOPIC_LABEL,
      seed: item.seed,
      writerName: WRITER_NAME,
      writerId: WRITER_ID,
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
