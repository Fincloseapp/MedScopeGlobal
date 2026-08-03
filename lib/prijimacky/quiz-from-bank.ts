import {
  filterBankQuestions,
  type BankQuestion,
  type BankDifficulty,
} from "@/lib/prijimacky/question-bank";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";
import { subjectLabel } from "@/lib/prijimacky/faculties-admissions";

export type GeneratedSelfTest = {
  id: string;
  title: string;
  passingScore: number;
  subjects: PrepSubject[];
  questions: Array<{
    id: string;
    question_text: string;
    question_type: "multiple_choice";
    options: string[];
    correct_answer: { index: number };
    explanation: string | null;
    sort_order: number;
    meta: { subject: PrepSubject; topic: string; difficulty: BankDifficulty };
  }>;
};

export function generateSelfTest(opts: {
  subjects?: PrepSubject[];
  count?: number;
  difficulty?: BankDifficulty | "all";
  seed?: string;
}): GeneratedSelfTest {
  const subjects = opts.subjects?.length ? opts.subjects : (["biologie", "chemie", "fyzika"] as PrepSubject[]);
  const count = opts.count ?? 15;
  const picked = filterBankQuestions({
    subjects,
    difficulty: opts.difficulty ?? "all",
    limit: count,
    seed: opts.seed,
  });

  const label =
    subjects.length === 3
      ? "Mixed self-test B/C/F"
      : subjects.map(subjectLabel).join(" + ");

  return {
    id: `self-${opts.seed ?? Date.now()}`,
    title: `${label} · ${picked.length} otázek`,
    passingScore: 70,
    subjects,
    questions: picked.map((q: BankQuestion, i) => ({
      id: q.id,
      question_text: q.question,
      question_type: "multiple_choice" as const,
      options: q.options,
      correct_answer: { index: q.correctIndex },
      explanation: q.explanation,
      sort_order: i,
      meta: { subject: q.subject, topic: q.topic, difficulty: q.difficulty },
    })),
  };
}
