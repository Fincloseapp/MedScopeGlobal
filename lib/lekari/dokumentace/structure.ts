import { generateTextFromLlm } from "@/lib/ai/chat-json";
import {
  DOKUMENTACE_MODES,
  getDokumentaceTemplate,
  type DokumentaceMode,
} from "@/lib/lekari/dokumentace/templates";

const SYSTEM_PROMPT = `Jsi asistent klinické dokumentace MeDiktor od MedScopeGlobal.
Piš výhradně česky, odborným lékařským stylem vhodným do zdravotnické dokumentace.
Nejsi zdravotnický prostředek (medical device) ani diagnostický nástroj.
Nevymýšlej fakta, hodnoty ani diagnózy, které nejsou v přepisu.
Chybějící údaje označ jako „neuvedeno“.
Výstup je návrh pro lékaře — lékař musí zápis zkontrolovat a schválit před uložením do zdravotnické dokumentace.
Nepřidávej právní disclaimer do těla zápisu, pokud o to není požádáno.`;

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

  const template = getDokumentaceTemplate(input.templateId);
  const sections = template.sections.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const specialtyLine = input.specialty?.trim()
    ? `Specializace / kontext: ${input.specialty.trim()}\n`
    : "";

  const modeHint =
    mode === "dictation"
      ? "Režim: diktát lékaře (bez pacienta). Přepiš a uspořádej diktovaný obsah."
      : "Režim: konzultace s pacientem. Extrahuj klinicky relevantní informace z rozhovoru.";

  const user = `${modeHint}
Šablona: ${template.label} (${template.id})
${specialtyLine}
Sekce zápisu (použij jako nadpisy):
${sections}

Přepis:
---
${transcript}
---

Sestav strukturovaný klinický zápis podle sekcí. Pouze fakta z přepisu. Chybějící = „neuvedeno“.`;

  const note = await generateTextFromLlm({
    system: SYSTEM_PROMPT,
    user,
    maxTokens: 4096,
    temperature: 0.2,
  });

  if (!note?.trim()) {
    throw new Error("Nepodařilo se sestavit zápis z AI — zkuste to znovu.");
  }

  return note.trim();
}
