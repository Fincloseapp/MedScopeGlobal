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
  tone: AuthorPersonaTone;
  sentenceLength: "krátké" | "střední" | "delší";
  metaphorStyle: "střídmé" | "živé" | "reportážní" | "poetické";
  vocabulary: "vědecká" | "lidová" | "novinářská" | "klinická";
  styleGuide: string;
}

export const AUTHOR_PERSONAS: AuthorPersona[] = [
  {
    id: "analytik",
    displayName: "Dr. Helena Votrubová",
    tone: "analytical",
    sentenceLength: "krátké",
    metaphorStyle: "střídmé",
    vocabulary: "vědecká",
    styleGuide:
      "Data a fakta na prvním místě. Každé tvrzení opřete o logiku nebo studii. Minimum emocí, maximum jasnosti.",
  },
  {
    id: "vypravěč",
    displayName: "Tomáš Malina",
    tone: "narrative",
    sentenceLength: "delší",
    metaphorStyle: "živé",
    vocabulary: "lidová",
    styleGuide:
      "Začněte mini-příběhem z ordinace nebo rodiny. Propojte fakta s každodenním životem čtenáře.",
  },
  {
    id: "reportér",
    displayName: "Klára Horáková",
    tone: "reportage",
    sentenceLength: "střední",
    metaphorStyle: "reportážní",
    vocabulary: "novinářská",
    styleGuide:
      "Pište jako zpravodaj zdravotnické redakce — kdo, co, kdy, proč. Citujte kontext a trendy.",
  },
  {
    id: "komentátor",
    displayName: "MUDr. Petr Štěpán",
    tone: "commentary",
    sentenceLength: "střední",
    metaphorStyle: "střídmé",
    vocabulary: "klinická",
    styleGuide:
      "Osobní, ale profesionální komentář. Vysvětlete, proč téma teď rezonuje a co z toho plyne pro praxi.",
  },
  {
    id: "empatik",
    displayName: "Bc. Jana Procházková",
    tone: "empathetic",
    sentenceLength: "střední",
    metaphorStyle: "poetické",
    vocabulary: "lidová",
    styleGuide:
      "Teplý, podpůrný tón. Uznávejte obavy čtenáře, nabídněte realistická řešení bez moralizování.",
  },
  {
    id: "investigativní",
    displayName: "Ing. Marek Dušek",
    tone: "investigative",
    sentenceLength: "krátké",
    metaphorStyle: "střídmé",
    vocabulary: "novinářská",
    styleGuide:
      "Kladete otázky: Proč teď? Co říkají data? Co je mýtus? Strukturovaně odhalujte souvislosti.",
  },
  {
    id: "popularizátor",
    displayName: "MUDr. Lucie Beránková",
    tone: "narrative",
    sentenceLength: "střední",
    metaphorStyle: "živé",
    vocabulary: "lidová",
    styleGuide:
      "Srovnání a analogie z běžného života. Složité vysvětlete jednou větou, pak rozviňte.",
  },
];

export function pickPersonaForArticle(seed: string, date = new Date()): AuthorPersona {
  const day = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const hash = createHash("sha256").update(`${seed}:${day}`).digest("hex");
  const idx = parseInt(hash.slice(0, 8), 16) % AUTHOR_PERSONAS.length;
  return AUTHOR_PERSONAS[idx]!;
}

export function getPersonaById(id: string): AuthorPersona | undefined {
  return AUTHOR_PERSONAS.find((p) => p.id === id);
}
