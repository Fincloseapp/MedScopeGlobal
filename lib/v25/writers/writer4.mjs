/**
 * Writer 4 — Rozhovory (pacienti, odborníci, příběhy)
 */
import { generatePublicArticle, PUBLIC_TOPICS, pickRotatedSeeds } from "./writer-base.mjs";

export const WRITER_ID = "writer4";
export const WRITER_NAME = "Redakce rozhovorů";
export const TOPIC = "rozhovory";
export const TOPIC_LABEL = PUBLIC_TOPICS[TOPIC];

export const SEEDS = [
  { seed: "Rozhovor s praktickým lékařem o prevenci", angle: "formát Q&A pro veřejnost" },
  { seed: "Příběh pacienta po infarktu — návrat k aktivnímu životu", angle: "inspirace bez senzace" },
  { seed: "Rozhovor s nutriční terapeutkou", angle: "mýty o dietách" },
  { seed: "Zkušenost pečovatele o duševním zdraví seniorů", angle: "rodina a podpora" },
  { seed: "Rozhovor s kardiologem o prevenci srdečních onemocnění", angle: "Q&A bez strašení" },
  { seed: "Příběh zotavení po operaci kolene", angle: "rehabilitace a motivace" },
];

export async function runWriter4(options = {}) {
  const limit = options.limit ?? 1;
  const writerIndex = options.writerIndex ?? 3;
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
