/**
 * Writer 2 desk — Nemoci. Four senior specialists via run-public-writers.
 */
import { runCategoryWriter } from "./run-category-writer.mjs";

export const WRITER_ID = "writer2";
export const WRITER_NAME = "Redakce vysvětlení nemocí";
export const TOPIC = "nemoci";
export const TOPIC_LABEL = "Nemoci";

export const SEEDS = [
  { seed: "Cukrovka 2. typu — co znamená pro každodenní život", angle: "srozumitelně bez strašení" },
  { seed: "Vysoký krevní tlak: kdy jít k lékaři", angle: "domácí měření a varovné signály" },
  { seed: "Sezónní alergie — jak se připravit na jaro", angle: "prevence a životní styl" },
  { seed: "Respirační infekce u dětí", angle: "kdy volat pediatra" },
  { seed: "Chřipka versus nachlazení — jak je rozlišit", angle: "praktický přehled pro rodiny" },
  { seed: "Bolesti hlavy — kdy je běžná a kdy urgentní", angle: "červené a zelené signály" },
  { seed: "Žaludeční potíže po svátcích", angle: "co dělat doma a kdy k lékaři" },
  { seed: "Astma v dospělosti — žít s ním, ne proti němu", angle: "inhalační režim a spouštěče" },
  { seed: "Reflux a pálení žáhy — kdy je to habit, kdy vyšetření", angle: "večeře, poloha, varovné znaky" },
  { seed: "Akné u dospělých — kůže, hormony, stres", angle: "bez hanby, s praktikem" },
];

export async function runWriter2(options = {}) {
  return runCategoryWriter({
    deskId: WRITER_ID,
    topic: TOPIC,
    topicLabel: TOPIC_LABEL,
    seeds: SEEDS,
    writerName: WRITER_NAME,
    defaultWriterIndex: 4,
    options,
  });
}
