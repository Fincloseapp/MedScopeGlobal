/**
 * Writer 4 desk — Rozhovory. Four senior specialists via run-public-writers.
 */
import { runCategoryWriter } from "./run-category-writer.mjs";

export const WRITER_ID = "writer4";
export const WRITER_NAME = "Redakce rozhovorů";
export const TOPIC = "rozhovory";
export const TOPIC_LABEL = "Rozhovory";

export const SEEDS = [
  { seed: "Rozhovor s praktickým lékařem o prevenci", angle: "formát Q&A pro veřejnost" },
  { seed: "Příběh pacienta po infarktu — návrat k aktivnímu životu", angle: "inspirace bez senzace" },
  { seed: "Rozhovor s nutriční terapeutkou", angle: "mýty o dietách" },
  { seed: "Zkušenost pečovatele o duševním zdraví seniorů", angle: "rodina a podpora" },
  { seed: "Rozhovor s kardiologem o prevenci srdečních onemocnění", angle: "Q&A bez strašení" },
  { seed: "Příběh zotavení po operaci kolene", angle: "rehabilitace a motivace" },
  { seed: "Rozhovor se sestrou v terénu o domácí péči", angle: "co rodiny podceňují" },
  { seed: "Q&A s lékárníkem o volně prodejných přípravcích", angle: "kdy stačí rada, kdy lékař" },
  { seed: "Příběh návratu ke spánku po nočních směnách", angle: "režim, světlo, rodina" },
];

export async function runWriter4(options = {}) {
  return runCategoryWriter({
    deskId: WRITER_ID,
    topic: TOPIC,
    topicLabel: TOPIC_LABEL,
    seeds: SEEDS,
    writerName: WRITER_NAME,
    defaultWriterIndex: 12,
    options,
  });
}
