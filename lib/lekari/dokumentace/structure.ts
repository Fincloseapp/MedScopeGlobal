import { resolveOpenAiKey } from "@/lib/ai/openai-key";
import { generateTextFromLlm } from "@/lib/ai/chat-json";
import {
  DOKUMENTACE_MODES,
  getDokumentaceTemplate,
  type DokumentaceMode,
} from "@/lib/lekari/dokumentace/templates";
import {
  localizedDokumentaceTemplate,
  structureClosingLine,
  structureModeHint,
  structureQualityLines,
  structureSystemPrompt,
} from "@/lib/lekari/dokumentace/note-language";

async function openaiClinicalText(input: {
  system: string;
  user: string;
  maxTokens: number;
}): Promise<string | null> {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) return null;
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.15,
        max_tokens: input.maxTokens,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
      }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

function cleanTranscript(transcript: string): string {
  return transcript
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function structureDokumentaceNote(input: {
  transcript: string;
  mode: DokumentaceMode | string;
  templateId: string;
  specialty?: string;
  locale?: string | null;
}): Promise<string> {
  const transcript = cleanTranscript(input.transcript);
  if (!transcript) {
    throw new Error("Přepis je prázdný — nelze sestavit zápis.");
  }

  const mode = (DOKUMENTACE_MODES.find((m) => m.id === input.mode)?.id ??
    "consultation") as DokumentaceMode;

  if (mode === "verbatim") {
    return transcript;
  }

  const locale = input.locale ?? "cs";
  const system = structureSystemPrompt(locale);
  const template = localizedDokumentaceTemplate(
    getDokumentaceTemplate(input.templateId),
    locale
  );
  const sections = template.sections.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const specialtyLine = input.specialty?.trim()
    ? `Specializace / kontext ordinace: ${input.specialty.trim()}\n`
    : "";

  const user = `${structureModeHint(mode, locale)}
Šablona: ${template.label} (${template.id})
${specialtyLine}
Sekce zápisu (použij přesně jako nadpisy v tomto pořadí):
${sections}

${structureQualityLines(locale)}

Přepis rozhovoru / diktátu:
---
${transcript}
---

${structureClosingLine(locale)}`;

  const maxTokens = 8192;

  const fromOpenAi = await openaiClinicalText({
    system,
    user,
    maxTokens,
  });
  if (fromOpenAi) return fromOpenAi;

  const note = await generateTextFromLlm({
    system,
    user,
    maxTokens,
    temperature: 0.15,
  });

  if (!note?.trim()) {
    throw new Error("Nepodařilo se sestavit zápis z AI — zkuste to znovu.");
  }

  return note.trim();
}
