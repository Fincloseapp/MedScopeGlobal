/**
 * Writer 3 desk — Prevence. Four senior specialists via run-public-writers.
 */
import { runCategoryWriter } from "./run-category-writer.mjs";

export const WRITER_ID = "writer3";
export const WRITER_NAME = "Redakce prevence";
export const TOPIC = "prevence";
export const TOPIC_LABEL = "Prevence";

export const SEEDS = [
  { seed: "Preventivní prohlídky u praktického lékaře", angle: "co čekat podle věku" },
  { seed: "Očkování dospělých — přehled bez mýtů", angle: "influenza, Tdap, pneumokok" },
  { seed: "Prevence kardiovaskulárních onemocnění", angle: "kouření, cholesterol, pohyb" },
  { seed: "Mentální prevence a duševní pohoda", angle: "kdy vyhledat odbornou pomoc" },
  { seed: "Screening rakoviny — co je dostupné v Česku", angle: "mamografie, kolonoskopie, HPV" },
  { seed: "Prevence osteoporózy u žen i mužů", angle: "vápník, vitamín D, pohyb" },
  { seed: "Zdraví očí a prevence zrakových problémů", angle: "praktické rady pro každodenní režim" },
  { seed: "Domácí lékárnička, která dává smysl", angle: "bez hamování zbytečností" },
  { seed: "Krevní tlak a cukr — kdy stačí domácí deník", angle: "čísla k lékaři, ne k panice" },
  { seed: "Prevence pádů u seniorů", angle: "síla, rovnováha, osvětlení bytu" },
];

export async function runWriter3(options = {}) {
  return runCategoryWriter({
    deskId: WRITER_ID,
    topic: TOPIC,
    topicLabel: TOPIC_LABEL,
    seeds: SEEDS,
    writerName: WRITER_NAME,
    defaultWriterIndex: 8,
    options,
  });
}
