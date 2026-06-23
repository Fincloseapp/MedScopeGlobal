import {
  generateJsonFromLlm,
  generateTextFromLlm,
  isLlmConfigured,
  resolvePrimaryLlmProvider,
} from "@/lib/ai/chat-json";
import { isBlockedSupabaseLimitationReply } from "@/lib/ai/reply-sanitize";
import { searchSupabaseForAssistant } from "@/lib/ai-medical/search";
import { logAiMedicalInteraction } from "@/lib/ai-medical/log";
import {
  ASSISTANT_LABELS_CS,
  type AiMedicalRequest,
  type AiMedicalResponse,
} from "@/lib/ai-medical/types";
import { SPECIALTY_LABELS_CS, type V4dSpecialty } from "@/lib/v4d/constants";

const LANG_NAMES: Record<string, string> = {
  cs: "čeština",
  sk: "slovenština",
  en: "angličtina",
};

const NO_SUPABASE_EXCUSE =
  "Nikdy nepiš o omezení Supabase, kontextu databáze ani že nemůžeš odpovědět kvůli systému. Pokud chybí záznamy v kontextu, odpověz z obecné medicínské znalosti a uveď, že je třeba ověřit primární zdroj.";

const ASSISTANT_SYSTEM: Record<string, string> = {
  doctor:
    "Jsi klinický AI asistent pro lékaře. Odpovídej evidence-based; využij přiložený kontext z databáze, pokud je k dispozici.",
  patient:
    "Jsi AI asistent pro pacienty. Piš srozumitelně, bez žargonu, s upozorněním konzultovat lékaře.",
  research:
    "Jsi výzkumný AI asistent. Zaměř se na metodologii, evidence level, limity studií.",
  legislativa:
    "Jsi legislativní AI asistent MZČR/SÚKL/ÚZIS/EU — přesné odkazy na zdroje.",
  leky:
    "Jsi farmakovigilanční AI asistent — EMA, FDA, SÚKL, indikace, bezpečnost.",
  studie:
    "Jsi asistent pro klinické studie — RCT, meta-analýzy, revmatologie a obory.",
  univerzity:
    "Jsi asistent pro univerzitní a výzkumné novinky CZ/SK/EU/svět.",
};

async function tryGroqPlainTextAnswer(
  req: AiMedicalRequest,
  contextBlock: string,
  sources: AiMedicalResponse["sources"]
): Promise<AiMedicalResponse | null> {
  const system = `${ASSISTANT_SYSTEM[req.assistant]}
${NO_SUPABASE_EXCUSE}
Jazyk: ${LANG_NAMES[req.language] ?? req.language}.
${req.outputType === "patient" ? "Piš pro pacienty." : "Piš pro lékaře."}`;

  const user = `Dotaz: ${req.query}

Kontext z databáze:
${contextBlock || "(bez přímých záznamů — odpověz odborně obecně)"}`;

  const text = await generateTextFromLlm({ system, user, maxTokens: 2800 });
  if (!text || isBlockedSupabaseLimitationReply(text)) return null;

  return {
    reply: text,
    summary: text.slice(0, 400),
    recommendations: [],
    clinicalConclusions: [],
    graphicSummary: `[AI Medical · Groq]\n${text.slice(0, 500)}`,
    sources,
    metadata: {
      llm_provider: resolvePrimaryLlmProvider(),
      response_mode: "plain_text",
    },
  };
}

function buildFallback(req: AiMedicalRequest, sourcesCount: number): AiMedicalResponse {
  const label = ASSISTANT_LABELS_CS[req.assistant];
  const lang = LANG_NAMES[req.language] ?? req.language;
  const tone =
    req.outputType === "patient"
      ? "Pacientské shrnutí: "
      : "Odborné shrnutí: ";

  return {
    reply: `${tone}${req.query}\n\n(${label} — nalezeno ${sourcesCount} záznamů v databázi. Pro plné AI nastavte GROQ_API_KEY zdarma na https://console.groq.com.)`,
    summary: `Dotaz zpracován v režimu fallback. Jazyk: ${lang}.`,
    recommendations: [
      "Ověřte údaje vůči primárním zdrojům.",
      "Přidejte GROQ_API_KEY (gsk_…) — primární free engine V5.",
    ],
    clinicalConclusions: ["Klinické závěry vyžadují GROQ_API_KEY nebo záložní LLM."],
    graphicSummary: `[Přehled]\n• Dotaz: ${req.query.slice(0, 80)}…\n• Zdroje: ${sourcesCount}\n• Asistent: ${req.assistant}`,
    sources: [],
    metadata: { fallback: true },
  };
}

export async function runAiMedicalAssistant(
  req: AiMedicalRequest,
  userId?: string | null
): Promise<AiMedicalResponse> {
  const sources = await searchSupabaseForAssistant(req.assistant, req.query, {
    specialty: req.specialty,
    diagnosis: req.diagnosis,
    studyType: req.studyType,
    drugName: req.drugName,
    legislationCategory: req.legislationCategory,
  });

  if (!isLlmConfigured()) {
    const fallback = buildFallback(req, sources.length);
    fallback.sources = sources;
    await logAiMedicalInteraction(req, fallback, userId);
    return fallback;
  }

  const outputGuide =
    req.outputType === "patient"
      ? "Piš pro pacienty — jednoduché věty, bez diagnóz bez kontextu."
      : "Piš odborně pro lékaře — strukturovaně, s citacemi.";

  const specialtyLabel = req.specialty
    ? SPECIALTY_LABELS_CS[req.specialty as V4dSpecialty] ?? req.specialty
    : "všechny obory";

  const contextBlock = sources
    .map(
      (s, i) =>
        `[${i + 1}] ${s.source} | ${s.title}\n${s.snippet}${s.url ? `\nURL: ${s.url}` : ""}`
    )
    .join("\n\n");

  const system = `${ASSISTANT_SYSTEM[req.assistant]}
${NO_SUPABASE_EXCUSE}
${outputGuide}
Jazyk odpovědi: ${LANG_NAMES[req.language] ?? req.language}.
Obor: ${specialtyLabel}.
Filtry: diagnóza=${req.diagnosis ?? "—"}, typ studie=${req.studyType ?? "—"}, lék=${req.drugName ?? "—"}, legislativa=${req.legislationCategory ?? "—"}.
Vrať pouze validní JSON.`;

  const user = `Dotaz uživatele: ${req.query}

Kontext z databáze (${sources.length} záznamů):
${contextBlock || "(žádné přímé shody — odpověz z obecné medicínské znalosti, uveď potřebu ověření u zdroje)"}

JSON:
{
  "reply": "hlavní odpověď",
  "summary": "krátké shrnutí",
  "recommendations": ["doporučení 1", "..."],
  "clinical_conclusions": ["závěr 1", "..."],
  "graphic_summary": "textový ASCII/blokový grafický přehled (osey, odrážky, sekce)"
}`;

  try {
    const raw = await generateJsonFromLlm({ system, user, maxTokens: 2800 });
    if (!raw) {
      const plain = await tryGroqPlainTextAnswer(req, contextBlock, sources);
      if (plain) {
        await logAiMedicalInteraction(req, plain, userId);
        return plain;
      }
      const fb = buildFallback(req, sources.length);
      fb.sources = sources;
      await logAiMedicalInteraction(req, fb, userId);
      return fb;
    }

    const parsed = JSON.parse(raw) as {
      reply?: string;
      summary?: string;
      recommendations?: string[];
      clinical_conclusions?: string[];
      graphic_summary?: string;
    };

    let replyText = parsed.reply ?? raw;
    if (isBlockedSupabaseLimitationReply(replyText)) {
      const plain = await tryGroqPlainTextAnswer(req, contextBlock, sources);
      if (plain) {
        await logAiMedicalInteraction(req, plain, userId);
        return plain;
      }
      replyText = raw;
    }

    const response: AiMedicalResponse = {
      reply: replyText,
      summary: parsed.summary ?? "",
      recommendations: parsed.recommendations ?? [],
      clinicalConclusions: parsed.clinical_conclusions ?? [],
      graphicSummary: parsed.graphic_summary ?? "",
      sources,
      metadata: {
        assistant: req.assistant,
        language: req.language,
        outputType: req.outputType,
        sources_count: sources.length,
        llm_provider: resolvePrimaryLlmProvider(),
      },
    };

    await logAiMedicalInteraction(req, response, userId);
    return response;
  } catch {
    const plain = await tryGroqPlainTextAnswer(req, contextBlock, sources);
    if (plain) {
      await logAiMedicalInteraction(req, plain, userId);
      return plain;
    }
    const fb = buildFallback(req, sources.length);
    fb.sources = sources;
    await logAiMedicalInteraction(req, fb, userId);
    return fb;
  }
}
