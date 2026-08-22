import { BIOLOGIE_QUESTIONS } from "@/lib/prep/questions/biologie";
import { CHEMIE_QUESTIONS } from "@/lib/prep/questions/chemie";
import { FYZIKA_QUESTIONS } from "@/lib/prep/questions/fyzika";
import { MULTI_QUESTIONS } from "@/lib/prep/questions/multi";
import type { PrepQuestion } from "@/lib/prep/types";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";

export const PREP_QUESTIONS: PrepQuestion[] = [
  ...BIOLOGIE_QUESTIONS,
  ...CHEMIE_QUESTIONS,
  ...FYZIKA_QUESTIONS,
  ...MULTI_QUESTIONS,
];

export function prepBankStats() {
  const bySubject: Record<string, number> = {};
  const byChapter: Record<string, number> = {};
  for (const q of PREP_QUESTIONS) {
    bySubject[q.subject] = (bySubject[q.subject] ?? 0) + 1;
    byChapter[q.chapterId] = (byChapter[q.chapterId] ?? 0) + 1;
  }
  return {
    total: PREP_QUESTIONS.length,
    bySubject: bySubject as Record<PrepSubject, number>,
    byChapter,
    multi: MULTI_QUESTIONS.length,
  };
}

export function questionsForChapter(chapterId: string): PrepQuestion[] {
  return PREP_QUESTIONS.filter((q) => q.chapterId === chapterId);
}

export function questionsForTopic(topic: string): PrepQuestion[] {
  return PREP_QUESTIONS.filter((q) => q.topic === topic);
}

export function listPrepTopics(subject?: PrepSubject): string[] {
  const set = new Set<string>();
  for (const q of PREP_QUESTIONS) {
    if (subject && q.subject !== subject) continue;
    set.add(q.topic);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "cs"));
}
