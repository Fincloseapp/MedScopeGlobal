import { resolveOpenAiKey } from "@/lib/ai/openai-key";
import { generateTextFromLlm } from "@/lib/ai/chat-json";
import {
  DOKUMENTACE_MODES,
  getDokumentaceTemplate,
  type DokumentaceMode,
} from "@/lib/lekari/dokumentace/templates";

const SYSTEM_PROMPT = `Jsi seniorní klinický dokumentarista MeDiktor (MedScopeGlobal) pro české lékaře.
Piš výhradně spisovnou odbornou lékařskou češtinou — stylem hotového ambulantního / chorobopisného zápisu do NIS.

Cíl: gramaticky správný, terminologicky přesný a klinicky použitelný zápis — ne hovorový přepis ani stručný výcuc.

Jazyk a styl (povinné):
- Spisovná čeština s diakritikou; správné pády, shoda podmětu s přísudkem, rod a číslo.
- Klinický sloh ve 3. osobě (např. „Pacient udává…“, „Objektivně…“, „Doporučeno…“), ne tykání ani hovor („bolí mě“, „docela hodně“).
- Hovorové formulace pacienta převeď do odborné terminologie při zachování významu (např. „tlak“ → arteriální hypertenze jen pokud z kontextu vyplývá; jinak „bolest hlavy / elevace TK“ dle přepisu).
- Preferuj české lékařské termíny; latinské/anglické jen tam, kde jsou v české dokumentaci obvyklé (např. status praesens, dg., th.).
- Celé věty nebo ustálené klinické fráze; vyhýbej se heslům typu „bolest ++“ bez rozvedení, pokud přepis obsahuje více.
- Čísla, jednotky a léky zapisuj standardně (mg, tbl., 1-0-1, mmHg, tepů/min).

Obsahová pravidla:
1) Rozlišuj mluvčí: údaje od pacienta vs. lékaře; význam neměň.
2) Vyplň každou sekci šablony. Konkrétně: léky (název, síla, dávkování), trvání, lokalizace, charakter, faktory, asociované příznaky.
3) Nevymýšlej fakta, hodnoty ani diagnózy mimo přepis. Chybí-li sekce → „neuvedeno“.
4) U konzultace systematicky vytěž: NO, OA, RA, FA, AA, SA/PA, abúzus; gynekologickou anamnézu jen pokud zazněla.
5) Negativní údaje z přepisu uváděj („alergie neudává“, „nekuřák“).
6) Objektivní nález jen z přepisu; jinak „neuvedeno“.
7) Diagnóza / plán jen z přepisu; formuluj jako pracovní diagnózu / doporučení.
8) Do těla zápisu nedávej disclaimer ani meta-komentáře.
9) Výstup je návrh ke kontrole lékařem, ne autonomní diagnóza.`;

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
      ? "Režim: DIKTÁT lékaře (bez pacienta). Uspořádej diktát do plného klinického zápisu ve spisovné odborné češtině; oprav gramatiku a terminologii, nepřidávej nová fakta."
      : "Režim: KONZULTACE / rozhovor lékař–pacient. Systematicky vytěž všechny klinicky relevantní údaje. Převeď hovorovou češtinu pacienta do odborného zápisu; zachovej význam. Anamnéza musí být bohatá a použitelná v ordinaci.";

  const user = `${modeHint}
Šablona: ${template.label} (${template.id})
${specialtyLine}
Sekce zápisu (použij přesně jako nadpisy v tomto pořadí):
${sections}

Požadavky na kvalitu a jazyk:
- Gramaticky správná odborná lékařská čeština (diakritika, pády, klinický sloh).
- Každá sekce: 2–8 vět podle obsahu přepisu (ne jedno slovo, pokud přepis obsahuje více).
- U léků: název, síla, dávkování, pokud zaznělo.
- U potíží: od kdy, průběh, intenzita, lokalizace, doprovodné příznaky.
- Odděl subjektivní údaje od objektivního nálezu, pokud šablona odděluje.
- Na konci nepřidávej obecné rady mimo přepis.
- Nepoužívej anglické věty (u SOAP ponech jen nadpisy S/O/A/P, obsah piš česky).

Přepis rozhovoru / diktátu:
---
${transcript}
---

Sestav kompletní strukturovaný klinický zápis ve spisovné odborné lékařské češtině.`;

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
