import type { PrepQuestion, PrepScoring } from "@/lib/prep/types";

export function isMulti(q: PrepQuestion): boolean {
  return Array.isArray(q.correctIndices) && q.correctIndices.length > 0;
}

export function correctSet(q: PrepQuestion): Set<number> {
  if (isMulti(q)) return new Set(q.correctIndices);
  return new Set([q.correctIndex]);
}

export function isAnswerCorrect(q: PrepQuestion, answer: number | number[] | undefined): boolean {
  if (answer === undefined) return false;
  const expected = correctSet(q);
  const given = new Set(Array.isArray(answer) ? answer : [answer]);
  if (expected.size !== given.size) return false;
  for (const i of expected) if (!given.has(i)) return false;
  return true;
}

export function scoreAttempt(
  questions: PrepQuestion[],
  answers: Record<string, number | number[]>,
  scoring: PrepScoring
): { correct: number; total: number; raw: number; scorePct: number; weakTopics: string[] } {
  const total = questions.length;
  let correct = 0;
  let raw = 0;
  const topicHits: Record<string, { ok: number; n: number; subject: PrepQuestion["subject"] }> = {};

  for (const q of questions) {
    const ok = isAnswerCorrect(q, answers[q.id]);
    if (ok) {
      correct += 1;
      raw += 1;
    } else if (scoring === "plusMinus" && answers[q.id] !== undefined) {
      raw -= 0.25;
    }
    const key = q.topic;
    if (!topicHits[key]) topicHits[key] = { ok: 0, n: 0, subject: q.subject };
    topicHits[key].n += 1;
    if (ok) topicHits[key].ok += 1;
  }

  const scorePct = total ? Math.max(0, Math.round((raw / total) * 100)) : 0;
  const weakTopics = Object.entries(topicHits)
    .filter(([, v]) => v.n > 0 && v.ok / v.n < 0.7)
    .sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)
    .map(([topic]) => topic);

  return { correct, total, raw, scorePct, weakTopics };
}
