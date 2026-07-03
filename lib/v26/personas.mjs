import { createHash } from "node:crypto";

import { getPersonasForTopic } from "./persona-config.mjs";

/** Internal writing-style personas — no personal bylines; display uses editorial units. */

export const AUTHOR_PERSONAS = [
  {
    id: "analytik",
    tone: "analytical",
    sentenceLength: "krátké",
    metaphorStyle: "střídmé",
    vocabulary: "vědecká",
    openingStyle: "Začni konkrétním číslem, studií nebo srovnáním trendů.",
    styleGuide:
      "Data a fakta na prvním místě. Každé tvrzení opřete o logiku nebo studii. Minimum emocí, maximum jasnosti.",
  },
  {
    id: "vypravěč",
    tone: "narrative",
    sentenceLength: "delší",
    metaphorStyle: "živé",
    vocabulary: "lidová",
    openingStyle: "Začni mini-příběhem z ordinace, rodiny nebo sousedství (2–3 věty).",
    styleGuide:
      "Propojte fakta s každodenním životem čtenáře. Používejte scény a dialog, ne obecné fráze.",
  },
  {
    id: "reportér",
    tone: "reportage",
    sentenceLength: "střední",
    metaphorStyle: "reportážní",
    vocabulary: "novinářská",
    openingStyle: "Začni zpravodajským leadem: kdo, co, kdy, proč — jedna silná věta.",
    styleGuide:
      "Pište jako zpravodaj zdravotnické redakce. Citujte kontext, trendy a reálné situace v Česku.",
  },
  {
    id: "komentátor",
    tone: "commentary",
    sentenceLength: "střední",
    metaphorStyle: "střídmé",
    vocabulary: "klinická",
    openingStyle: "Začni osobním postřehem z praxe nebo otázkou, kterou pacienti kladou často.",
    styleGuide:
      "Osobní, ale profesionální komentář. Vysvělte, proč téma teď rezonuje a co z toho plyne.",
  },
  {
    id: "empatik",
    tone: "empathetic",
    sentenceLength: "střední",
    metaphorStyle: "poetické",
    vocabulary: "lidová",
    openingStyle: "Začni uznáním obav čtenáře — bez moralizování, s teplem a respektem.",
    styleGuide:
      "Teplý, podpůrný tón. Uznávejte obavy, nabídněte realistická řešení. Krátké odstavce.",
  },
  {
    id: "investigativní",
    tone: "investigative",
    sentenceLength: "krátké",
    metaphorStyle: "střídmé",
    vocabulary: "novinářská",
    openingStyle: "Začni provokativní otázkou nebo rozporuplným mýtem, který čtenáře zajímá.",
    styleGuide:
      "Kladete otázky: Proč teď? Co říkají data? Co je mýtus? Strukturovaně odhalujte souvislosti.",
  },
  {
    id: "popularizátor",
    tone: "narrative",
    sentenceLength: "střední",
    metaphorStyle: "živé",
    vocabulary: "lidová",
    openingStyle: "Začni srovnáním z běžného života — analogie, která téma okamžitě zpřístupní.",
    styleGuide:
      "Srovnání a analogie z běžného života. Složité vysvětlete jednou větou, pak rozviňte.",
  },
];

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

function pickWeightedPersona(pool, seed, date, writerIndex, salt = "") {
  const day = dayOfYear(date);
  const hash = createHash("sha256").update(`${seed}:${day}:${writerIndex}${salt}`).digest("hex");
  const roll = parseInt(hash.slice(0, 8), 16);
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = roll % totalWeight;
  for (const entry of pool) {
    cursor -= entry.weight;
    if (cursor < 0) return entry.persona;
  }
  return pool[0]?.persona ?? AUTHOR_PERSONAS[0];
}

/** Deterministic writing-style persona per article seed, day, writer slot, and optional topic weights. */
export function pickPersonaForArticle(seed, date = new Date(), writerIndex = 0, topic = null) {
  const pool = topic ? getPersonasForTopic(topic) : AUTHOR_PERSONAS.map((persona) => ({ persona, weight: 1 }));
  return pickWeightedPersona(pool, seed, date, writerIndex);
}

/** Pick a different persona on similarity retry. */
export function pickAlternatePersona(seed, excludeId, attempt, date = new Date(), writerIndex = 0, topic = null) {
  const pool = (topic ? getPersonasForTopic(topic) : AUTHOR_PERSONAS.map((persona) => ({ persona, weight: 1 }))).filter(
    (entry) => entry.persona.id !== excludeId
  );
  if (!pool.length) return AUTHOR_PERSONAS[0];
  return pickWeightedPersona(pool, seed, date, writerIndex, `:retry:${attempt}`);
}

export function getPersonaById(id) {
  return AUTHOR_PERSONAS.find((p) => p.id === id);
}
