import type { PatientSummary } from "@/lib/medipacient/patient-summary";

/** Text spoken by the browser: translation + recommended next steps only. */
export function buildReadAloudText(summary: PatientSummary): string {
  const parts: string[] = [];
  const preklad = summary.srozumitelny_preklad.trim();
  if (preklad) parts.push(preklad);
  if (summary.doporuceny_postup.length) {
    parts.push("Co dál.");
    for (const item of summary.doporuceny_postup) {
      const step = item.trim().replace(/[.!?…]+$/u, "");
      if (step) parts.push(`${step}.`);
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function splitForSpeech(text: string, max = 420): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const sentences = trimmed.split(/(?<=[.!?…])\s+/u).map((s) => s.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  for (const sentence of sentences.length ? sentences : [trimmed]) {
    const next = buf ? `${buf} ${sentence}` : sentence;
    if (buf && next.length > max) {
      chunks.push(buf);
      buf = sentence;
    } else {
      buf = next;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}
