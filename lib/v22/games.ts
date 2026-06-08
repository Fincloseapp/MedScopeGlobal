import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";

export type V22QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type V22StudyGame = {
  slug: string;
  title: string;
  topic: string;
  description: string;
  imageUrl: string;
  questions: V22QuizQuestion[];
  updatedAt: string;
};

/** Vlastní vzdělávací hry — inspirace principy NZIP, originální texty a UI */
export const V22_STUDY_GAMES: V22StudyGame[] = [
  {
    slug: "anatomie-systemy",
    title: "Anatomie: lidské systémy",
    topic: "Anatomie",
    description: "Kvíz o kosterním, svalovém, nervovém a cévním systému pro studenty 1.–2. ročníku.",
    imageUrl: V21_MEDICAL_IMAGES.anatomy,
    updatedAt: "2026-06-10",
    questions: [
      {
        id: "a1",
        prompt: "Která kost tvoří největší část plochy pánevního kruhu?",
        options: ["Křížová kost", "Stěrka", "Kyčelní kost", "Sedací kost"],
        correctIndex: 2,
        explanation: "Kyčelní kost (os coxae) tvoří boční a přední část pánve po spojení s kostí sedací a stěrkovou.",
      },
      {
        id: "a2",
        prompt: "Který nerv inervuje bránici jako hlavní motorický nerv?",
        options: ["N. vagus", "N. phrenicus", "N. accessorius", "N. intercostalis"],
        correctIndex: 1,
        explanation: "Nervus phrenicus (C3–C5) je hlavní motorický nerv bránice.",
      },
      {
        id: "a3",
        prompt: "Která struktura odděluje pravou a levou komoru srdce?",
        options: ["Septum interatriale", "Septum interventriculare", "Valva mitralis", "Valva tricuspidalis"],
        correctIndex: 1,
        explanation: "Septum interventriculare odděluje komory; septum interatriale odděluje síně.",
      },
    ],
  },
  {
    slug: "fyziologie-homeostaza",
    title: "Fyziologie: homeostáza",
    topic: "Fyziologie",
    description: "Test základních fyziologických principů — acidobazická rovnováha, regulace TK a glukózy.",
    imageUrl: V21_MEDICAL_IMAGES.medicina,
    updatedAt: "2026-06-10",
    questions: [
      {
        id: "f1",
        prompt: "Který hormon snižuje hladinu glukózy v krvi?",
        options: ["Glukagon", "Kortizol", "Inzulin", "Adrenalin"],
        correctIndex: 2,
        explanation: "Inzulin podporuje vstup glukózy do buněk a snižuje glykémii.",
      },
      {
        id: "f2",
        prompt: "Normální pH arteriální krve je přibližně:",
        options: ["6,8", "7,0", "7,4", "8,0"],
        correctIndex: 2,
        explanation: "Fyziologické pH arteriální krve je 7,35–7,45; střed ~7,4.",
      },
      {
        id: "f3",
        prompt: "Baroreceptorový reflex primárně reguluje:",
        options: ["Teplotu těla", "Krevní tlak", "Hladinu Ca²⁺", "Dýchací frekvenci"],
        correctIndex: 1,
        explanation: "Baroreceptory v sinus caroticus a aorte monitorují TK a spouštějí autonomní kompenzaci.",
      },
    ],
  },
  {
    slug: "patologie-zaklady",
    title: "Patologie: základy",
    topic: "Patologie",
    description: "Kvíz o zánětu, nekróze a základních patogenetických mechanismech.",
    imageUrl: V21_MEDICAL_IMAGES.study,
    updatedAt: "2026-06-10",
    questions: [
      {
        id: "p1",
        prompt: "Akutní zánět je charakterizován všemi kromě:",
        options: ["Rubor", "Calor", "Atrofie", "Dolor"],
        correctIndex: 2,
        explanation: "Klassické znaky zánětu: rubor, calor, tumor, dolor, functio laesa. Atrofie není typická pro akutní zánět.",
      },
      {
        id: "p2",
        prompt: "Koagulační nekróza je typická pro:",
        options: ["Mozek", "Srdce po infarktu", "Játra při virové hepatitidě", "Pneumonie"],
        correctIndex: 1,
        explanation: "Ischémie myokardu vede ke koagulační nekróze s homogenní eosinofilní hmotou.",
      },
    ],
  },
  {
    slug: "prijimacky-biologie",
    title: "Přijímačky: biologie",
    topic: "Přijímačky",
    description: "Modelové otázky z biologie pro uchazeče o studium medicíny.",
    imageUrl: V21_MEDICAL_IMAGES.university,
    updatedAt: "2026-06-10",
    questions: [
      {
        id: "b1",
        prompt: "Mitochondrie jsou primárně místem:",
        options: ["Fotosyntézy", "Oxidativní fosforylace", "Transkripce DNA", "Syntézy proteinů na ribozomech"],
        correctIndex: 1,
        explanation: "Mitochondrie jsou hlavním zdrojem ATP v eukaryotních buňkách.",
      },
      {
        id: "b2",
        prompt: "Která bázová dvojice je stabilizována třemi vodíkovými můstky?",
        options: ["A–T", "G–C", "A–G", "T–C"],
        correctIndex: 1,
        explanation: "Guanin a cytosin tvoří tři vodíkové můstky; A–T má dva.",
      },
    ],
  },
  {
    slug: "lekarska-terminologie",
    title: "Lékařská terminologie",
    topic: "Terminologie",
    description: "Procvičení latinských a řeckých kořenů běžně používaných v medicíně.",
    imageUrl: V21_MEDICAL_IMAGES.medicina,
    updatedAt: "2026-06-10",
    questions: [
      {
        id: "t1",
        prompt: "Prefix „hyper-“ znamená:",
        options: ["Pod", "Nad / zvýšený", "Bez", "Proti"],
        correctIndex: 1,
        explanation: "Hyper- = nad normou (hypertenze, hyperglykémie).",
      },
      {
        id: "t2",
        prompt: "„-itis“ v názvu onemocnění obvykle značí:",
        options: ["Nádor", "Zánět", "Krvácení", "Vývojovou vadu"],
        correctIndex: 1,
        explanation: "Suffix -itis označuje zánět (artritida, gastritida).",
      },
    ],
  },
];

export function getStudyGameBySlug(slug: string): V22StudyGame | null {
  return V22_STUDY_GAMES.find((g) => g.slug === slug) ?? null;
}

export const OBOR_KEYWORDS: Record<string, string[]> = {
  anatomie: ["anatom", "kost", "sval", "nerv"],
  fyziologie: ["fyziolog", "homeost", "metabol"],
  patologie: ["patolog", "zánět", "nekróz", "onkolog"],
  klinika: ["klinik", "intern", "chirurg", "pediatr"],
  zkousky: ["zkoušk", "státnic", "atest", "test"],
};
