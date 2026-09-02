/**
 * Writer 1 desk — Životní styl. Four senior specialists via run-public-writers.
 */
import { runCategoryWriter } from "./run-category-writer.mjs";

export const WRITER_ID = "writer1";
export const WRITER_NAME = "Redakce životního stylu";
export const TOPIC = "zivotni-styl";
export const TOPIC_LABEL = "Životní styl";

export const SEEDS = [
  { seed: "Zdravý spánek v zimním období", angle: "praktické tipy pro domácnost" },
  { seed: "Pohyb pro zaneprázdněné rodiče", angle: "10 minut denně bez posilovny" },
  { seed: "Vyvážená strava bez extrémů", angle: "středomořský talíř v české kuchyni" },
  { seed: "Stres z práce a jeho vliv na imunitu", angle: "dechová cvičení a režim dne" },
  { seed: "Hydratace a energie v chladném počasí", angle: "mýty o pitném režimu" },
  { seed: "Digitální detox a duševní pohoda", angle: "realistické kroky bez radikálních změn" },
  { seed: "Sezónní únava — co pomáhá a co je normální", angle: "spánek, světlo, pohyb" },
  { seed: "Ranní světlo a večerní obrazovky", angle: "circadian rytmus bez gadgetů" },
  { seed: "Svačiny ve směnném provozu", angle: "energie bez cukrového kolotoče" },
  { seed: "Chůze jako lék, který má skoro každý", angle: "kroky, tempo, kolena" },
];

export async function runWriter1(options = {}) {
  return runCategoryWriter({
    deskId: WRITER_ID,
    topic: TOPIC,
    topicLabel: TOPIC_LABEL,
    seeds: SEEDS,
    writerName: WRITER_NAME,
    defaultWriterIndex: 0,
    options,
  });
}
