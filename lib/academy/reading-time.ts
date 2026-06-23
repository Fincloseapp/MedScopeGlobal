/** Czech reading/listening time estimates (150 WPM). */

export const CZECH_WPM = 150;

export function countWords(text: string): number {
  const cleaned = text.replace(/[#*_\[\]()]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(text: string, wpm = CZECH_WPM): number {
  const words = countWords(text);
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / wpm));
}

export function lessonListenText(input: {
  title: string;
  content?: string | null;
  slides?: { title?: string; body?: string }[];
}): string {
  const parts = [input.title, input.content ?? ""];
  for (const s of input.slides ?? []) {
    if (s.title || s.body) parts.push(`${s.title ?? ""}. ${s.body ?? ""}`);
  }
  return parts.filter(Boolean).join("\n\n");
}

export function lessonReadingMinutes(input: {
  title: string;
  content?: string | null;
  slides?: { title?: string; body?: string }[];
}): number {
  return readingMinutes(lessonListenText(input));
}

export function courseReadingMinutes(
  lessons: { title: string; content?: string | null; slides?: { title?: string; body?: string }[] }[]
): number {
  return lessons.reduce((sum, l) => sum + lessonReadingMinutes(l), 0);
}
