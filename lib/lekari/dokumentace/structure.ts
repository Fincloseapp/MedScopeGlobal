import { resolveOpenAiKey } from "@/lib/ai/openai-key";
import { generateTextFromLlm } from "@/lib/ai/chat-json";
import {
  DOKUMENTACE_MODES,
  getDokumentaceTemplate,
  type DokumentaceMode,
} from "@/lib/lekari/dokumentace/templates";

const SYSTEM_PROMPT = `Jsi seniorní klinický dokumentarista MeDiktor (MedScopeGlobal) pro české lékaře.
Piš výhradně česky, stylem hotového ambulantního / anamnestického zápisu do zdravotnické dokumentace (NIS).

Cíl: profesionální, úplný a použitelný zápis — ne stručný souhrn.

Pravidla:
1) Rozlišuj mluvčí: informace od lékaře vs. od pacienta. Pacientovy odpovědi převeď do odborného jazyka, ale zachovej význam.
2) Vyplň každou sekci šablony. Pokud údaj v přepisu je, uveď ho konkrétně (léky s dávkou/frekvencí, trvání potíží, lokalizace, charakter, vyvolávající/ulevující faktory, asociované příznaky).
3) Nevymýšlej fakta, hodnoty ani diagnózy, které v přepisu nejsou. Chybí-li sekce → „neuvedeno“.
4) U rozhovoru (konzultace) systematicky vytěž anamnézu: NO, OA, RA, FA, AA, SA/PA, abúzus, gynekologickou anamnézu pokud zmíněna.
5) Negativní údaje z přepisu zapisuj (např. „alergie neudává“, „nekuřák“), pokud je pacient uvedl.
6) Objektivní nález jen pokud byl v přepisu; jinak „neuvedeno“.
7) Diagnóza / plán: pouze z přepisu; formuluj jako pracovní diagnózu / doporučení lékaře.
8) Nepřidávej disclaimer do těla zápisu.
9) Nejsi zdravotnický prostředek — výstup je návrh ke kontrole lékařem.`;

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
    ? `Specializace / kontext ordinace: ${input.specialty.trim()}\n`
    : "";

  const modeHint =
    mode === "dictation"
      ? "Režim: DIKTÁT lékaře (bez pacienta). Uspořádej diktovaný obsah do plného klinického zápisu, doplň odborné formulace bez přidání nových faktů."
      : "Režim: KONZULTACE / rozhovor lékař–pacient. Systematicky vytěž VŠECHNY klinicky relevantní odpovědi pacienta i pokyny lékaře. Anamnéza musí být bohatá a použitelná v ordinaci — ne heslovitý výcuc.";

  const user = `${modeHint}
Šablona: ${template.label} (${template.id})
${specialtyLine}
Sekce zápisu (použij přesně jako nadpisy v tomto pořadí):
${sections}

Požadavky na kvalitu:
- Každá sekce: 2–8 vět / odrážek podle obsahu přepisu (ne jedno slovo, pokud přepis obsahuje více).
- U léků: název, síla, dávkování, pokud zaznělo.
- U potíží: od kdy, průběh, intenzita, lokalizace, doprovodné příznaky.
- Odděl „Subjektivní (z anamnézy)“ od „Objektivní“, pokud šablona odděluje.
- Na konci nepřidávej obecné rady mimo přepis.

Přepis rozhovoru / diktátu:
---
${transcript}
---

Sestav kompletní strukturovaný klinický zápis.`;

  const maxTokens = 8192;

  const fromOpenAi = await openaiClinicalText({
    system: SYSTEM_PROMPT,
    user,
    maxTokens,
  });
  if (fromOpenAi) return fromOpenAi;

  const note = await generateTextFromLlm({
    system: SYSTEM_PROMPT,
    user,
    maxTokens,
    temperature: 0.15,
  });

  if (!note?.trim()) {
    throw new Error("Nepodařilo se sestavit zápis z AI — zkuste to znovu.");
  }

  return note.trim();
}
