/**
 * Writer 2 — Nemoci (diabetes, hypertenze, alergie, infekce)
 */
import { generatePublicArticle, PUBLIC_TOPICS, pickRotatedSeeds } from "./writer-base.mjs";

export const WRITER_ID = "writer2";
export const WRITER_NAME = "Redakce vysvětlení nemocí";
export const TOPIC = "nemoci";
export const TOPIC_LABEL = PUBLIC_TOPICS[TOPIC];

export const SEEDS = [
  { seed: "Cukrovka 2. typu — co znamená pro každodenní život", angle: "srozumitelně bez strašení" },
  { seed: "Vysoký krevní tlak: kdy jít k lékaři", angle: "domácí měření a varovné signály" },
  { seed: "Sezónní alergie — jak se připravit na jaro", angle: "prevence a životní styl" },
  { seed: "Respirační infekce u dětí", angle: "kdy volat pediatra" },
  { seed: "Chřipka versus nachlazení — jak je rozlišit", angle: "praktický přehled pro rodiny" },
  { seed: "Bolesti hlavy — kdy je běžná a kdy urgentní", angle: "červené a zelené signály" },
  { seed: "Žaludeční potíže po svátcích", angle: "co dělat doma a kdy k lékaři" },
];

export async function runWriter2(options = {}) {
  const limit = options.limit ?? 1;
  const writerIndex = options.writerIndex ?? 1;
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
