import { createHash } from "node:crypto";

export type AuthorPersonaTone =
  | "analytical"
  | "narrative"
  | "reportage"
  | "commentary"
  | "empathetic"
  | "investigative";

/** Internal writing-style persona — editorial units handle public bylines. */
export interface AuthorPersona {
  id: string;
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
    openingStyle: "Začni mini-příběhem z ordinace, rodiny nebo sousedství.",
    styleGuide:
      "Propojte fakta s každodenním životem čtenáře. Používejte scény a dialog, ne obecné fráze.",
  },
  {
    id: "reportér",
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
    tone: "commentary",
    sentenceLength: "střední",
    metaphorStyle: "střídmé",
    vocabulary: "klinická",
    openingStyle: "Začni osobním postřehem z praxe nebo otázkou od pacientů.",
    styleGuide:
      "Osobní, ale profesionální komentář. Vysvělte, proč téma teď rezonuje a co z toho plyne.",
  },
  {
    id: "empatik",
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
