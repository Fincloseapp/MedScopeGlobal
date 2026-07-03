import { createHash } from "node:crypto";

export type AuthorPersonaTone =
  | "analytical"
  | "narrative"
  | "reportage"
  | "commentary"
  | "empathetic"
  | "investigative";

export interface AuthorPersona {
  id: string;
  displayName: string;
  byline?: string;
  tone: AuthorPersonaTone;
  sentenceLength: "krátké" | "střední" | "delší";
  metaphorStyle: "střídmé" | "živé" | "reportážní" | "poetické";
  vocabulary: "vědecká" | "lidová" | "novinářská" | "klinická";
  openingStyle?: string;
  styleGuide: string;
}

export const AUTHOR_PERSONAS: AuthorPersona[] = [
  {
    id: "analytik",
    displayName: "Dr. Helena Votrubová",
    byline: "Redakce MedScopeGlobal — Dr. Helena Votrubová",
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
    displayName: "Tomáš Malina",
    byline: "Redakce MedScopeGlobal — Tomáš Malina",
    tone: "narrative",
    sentenceLength: "delší",
    metaphorStyle: "živé",
    vocabulary: "lidová",
    openingStyle: "Začni mini-příběhem z ordinace, rodiny nebo sousedství.",
    styleGuide:
      "Propojte fakta s každodenním životem čtenáře. Používejte scény a dialog, ne obecné fráze.",
  },
  {
    id: "reportér",
    displayName: "Klára Horáková",
    byline: "Redakce MedScopeGlobal — Klára Horáková",
    tone: "reportage",
    sentenceLength: "střední",
    metaphorStyle: "reportážní",
    vocabulary: "novinářská",
    openingStyle: "Začni zpravodajským leadem: kdo, co, kdy, proč.",
    styleGuide:
      "Pište jako zpravodaj zdravotnické redakce. Citujte kontext, trendy a reálné situace v Česku.",
  },
  {
    id: "komentátor",
    displayName: "MUDr. Petr Štěpán",
    byline: "Redakce MedScopeGlobal — MUDr. Petr Štěpán",
    tone: "commentary",
    sentenceLength: "střední",
    metaphorStyle: "střídmé",
    vocabulary: "klinická",
    openingStyle: "Začni osobním postřehem z praxe nebo otázkou od pacientů.",
    styleGuide:
      "Osobní, ale profesionální komentář. Vysvětlete, proč téma teď rezonuje a co z toho plyne.",
  },
  {
    id: "empatik",
    displayName: "Bc. Jana Procházková",
    byline: "Redakce MedScopeGlobal — Bc. Jana Procházková",
    tone: "empathetic",
    sentenceLength: "střední",
    metaphorStyle: "poetické",
    vocabulary: "lidová",
    openingStyle: "Začni uznáním obav čtenáře — bez moralizování.",
    styleGuide:
      "Teplý, podpůrný tón. Uznávejte obavy, nabídněte realistická řešení. Krátké odstavce.",
  },
  {
    id: "investigativní",
    displayName: "Ing. Marek Dušek",
    byline: "Redakce MedScopeGlobal — Ing. Marek Dušek",
    tone: "investigative",
    sentenceLength: "krátké",
    metaphorStyle: "střídmé",
    vocabulary: "novinářská",
    openingStyle: "Začni provokativní otázkou nebo mýtem.",
    styleGuide:
      "Kladete otázky: Proč teď? Co říkají data? Co je mýtus? Strukturovaně odhalujte souvislosti.",
  },
  {
    id: "popularizátor",
    displayName: "MUDr. Lucie Beránková",
    byline: "Redakce MedScopeGlobal — MUDr. Lucie Beránková",
    tone: "narrative",
    sentenceLength: "střední",
    metaphorStyle: "živé",
    vocabulary: "lidová",
    openingStyle: "Začni srovnáním z běžného života.",
    styleGuide:
      "Srovnání a analogie z běžného života. Složité vysvětlete jednou větou, pak rozviňte.",
  },
];

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function pickPersonaForArticle(seed: string, date = new Date(), writerIndex = 0): AuthorPersona {
  const day = dayOfYear(date);
  const hash = createHash("sha256").update(`${seed}:${day}:${writerIndex}`).digest("hex");
  const idx = parseInt(hash.slice(0, 8), 16) % AUTHOR_PERSONAS.length;
  return AUTHOR_PERSONAS[idx]!;
}

export function getPersonaById(id: string): AuthorPersona | undefined {
  return AUTHOR_PERSONAS.find((p) => p.id === id);
}
