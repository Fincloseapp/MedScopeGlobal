import type { V24QuizType } from "@/lib/v24/types";

export type V24QuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type V24Quiz = {
  slug: string;
  title: string;
  type: V24QuizType;
  locale: string;
  section: string;
  questions: V24QuizQuestion[];
};

const SAMPLE_QUIZZES: V24Quiz[] = [
  {
    slug: "farmakologie-antihypertenziva",
    title: "Farmakologie — antihypertenziva",
    type: "pharmacology",
    locale: "cs",
    section: "quizzes",
    questions: [
      {
        prompt: "Která třída je první volbou u nekomplikované hypertenze dle guidelines?",
        options: ["ACE inhibitory / ARB", "Loop diuretika", "Alfa-blokátory", "Kcentralní agonisté"],
        correctIndex: 0,
        explanation: "ACEi/ARB jsou standardní volba v mnoha guidelines pro nekomplikovanou hypertenzi.",
      },
    ],
  },
  {
    slug: "anatomie-dolni-koncetina",
    title: "Anatomie — dolní končetina",
    type: "anatomy",
    locale: "cs",
    section: "quizzes",
    questions: [
      {
        prompt: "Který nerv inervuje m. tibialis anterior?",
        options: ["N. fibularis profundus", "N. tibialis", "N. suralis", "N. saphenus"],
        correctIndex: 0,
        explanation: "M. tibialis anterior je inervován n. fibularis profundus.",
      },
    ],
  },
];

export function listV24Quizzes() {
  return SAMPLE_QUIZZES;
}

export function getV24Quiz(slug: string) {
  return SAMPLE_QUIZZES.find((q) => q.slug === slug) ?? null;
}

export function getV24SampleQuizzes() {
  return SAMPLE_QUIZZES;
}
