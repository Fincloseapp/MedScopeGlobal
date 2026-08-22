import type { PrepQuestion } from "@/lib/prep/types";
import type { PrepDifficulty } from "@/lib/prep/types";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";

export function Q(
  id: string,
  subject: PrepSubject,
  chapterId: string,
  topic: string,
  difficulty: PrepDifficulty,
  prompt: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  extra?: Pick<PrepQuestion, "faculties" | "correctIndices">
): PrepQuestion {
  return {
    id,
    subject,
    chapterId,
    topic,
    difficulty,
    prompt,
    options,
    correctIndex,
    explanation,
    ...extra,
  };
}
