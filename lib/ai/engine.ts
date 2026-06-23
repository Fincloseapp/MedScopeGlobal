/**
 * AI Engine v18 — hybrid inference, routing, documents, safety, audit.
 */
import { writeAiAuditLog } from "@/lib/ai/audit";
import { runGroqChain } from "@/lib/ai/groq";
import {
  AI_MODEL_FALLBACK_CHAIN,
  AI_MODELS,
  resolveGroqApiModel,
  ROUTING,
  selectModelChain,
  type AiModelId,
} from "@/lib/ai/models";
import { applySafetyLayer, scanInputSafety, type SafetyRisk } from "@/lib/ai/safety";
import { segmentDocument } from "@/lib/doc/extract";

export type V18Endpoint = "summarize" | "guideline" | "clinical-check";

export type RunAIInput = {
  endpoint: V18Endpoint;
  query: string;
  documentText?: string;
  userId?: string | null;
  prompt: string;
  requestId?: string;
};

export type RunAIResult = {
  answer: string;
  model: string;
  risk: SafetyRisk;
  disclaimer: string;
  segments: number;
  blocked: boolean;
  requestId: string;
};

const SYSTEM_PROMPT = `Jsi klinický AI asistent MedScopeGlobal v18.
Odpovídej česky, stručně a odborně.
Nikdy neposkytuj instrukce k nelegálním nebo nebezpečným činnostem.
Vždy zdůrazni, že jde o informativní výstup, ne o lékařskou radu.`;

function normalizeInput(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function buildContext(documentText: string): { context: string; segments: number } {
  const normalized = normalizeInput(documentText);
  if (!normalized) return { context: "", segments: 0 };

  const segments = segmentDocument(normalized, ROUTING.segmentSize);
  const joined = segments.join("\n\n---\n\n");
  const context =
    joined.length > ROUTING.maxPromptChars
      ? joined.slice(0, ROUTING.maxPromptChars)
      : joined;

  return { context, segments: segments.length };
}

function modelsForAttempt(
  query: string,
  documentText: string,
  useFullOutageChain: boolean
): string[] {
  const logical: AiModelId[] = useFullOutageChain
    ? [...AI_MODEL_FALLBACK_CHAIN]
    : selectModelChain(query, documentText);

  const unique = new Set<string>();
  for (const id of logical) {
    unique.add(resolveGroqApiModel(id));
  }
  for (const id of AI_MODEL_FALLBACK_CHAIN) {
    unique.add(resolveGroqApiModel(id));
  }
  return [...unique];
}

/** Main v18 inference entry — routing, fallback, safety, audit. */
export async function runAI(input: RunAIInput): Promise<RunAIResult> {
  const requestId =
    input.requestId ?? `v18-${input.endpoint}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const query = normalizeInput(input.query);
  const documentText = normalizeInput(input.documentText ?? "");
  const combinedInput = `${query}\n${documentText}`.trim();

  const inputSafety = scanInputSafety(combinedInput);
  if (inputSafety.blocked) {
    const blocked = applySafetyLayer(combinedInput, "");
    await writeAiAuditLog({
      userId: input.userId,
      model: AI_MODELS.primary,
      inputLength: combinedInput.length,
      outputLength: blocked.output.length,
      risk: blocked.risk,
      endpoint: input.endpoint,
      requestId,
      blocked: true,
      issues: inputSafety.issues,
    });
    return {
      answer: blocked.output,
      model: AI_MODELS.primary,
      risk: blocked.risk,
      disclaimer: blocked.disclaimer,
      segments: 0,
      blocked: true,
      requestId,
    };
  }

  const { context, segments } = buildContext(documentText);
  const userPrompt = context
    ? `${input.prompt}\n\n---\nDokument (${segments} segmentů):\n${context}`
    : input.prompt;

  const apiModels = modelsForAttempt(query, documentText, false);
  let groqResult;

  try {
    groqResult = await runGroqChain(apiModels, userPrompt, {
      system: SYSTEM_PROMPT,
      maxTokens: 4096,
      temperature: 0.25,
    });
  } catch {
    const outageModels = modelsForAttempt(query, documentText, true);
    groqResult = await runGroqChain(outageModels, userPrompt, {
      system: SYSTEM_PROMPT,
      maxTokens: 4096,
      temperature: 0.25,
    });
  }

  const safety = applySafetyLayer(combinedInput, groqResult.content, {
    stripDrugDosing: input.endpoint === "guideline",
  });

  await writeAiAuditLog({
    userId: input.userId,
    model: groqResult.model,
    inputLength: combinedInput.length,
    outputLength: safety.output.length,
    risk: safety.risk,
    endpoint: input.endpoint,
    requestId,
    blocked: safety.blocked,
    issues: safety.issues,
  });

  return {
    answer: safety.output,
    model: groqResult.model,
    risk: safety.risk,
    disclaimer: safety.disclaimer,
    segments,
    blocked: safety.blocked,
    requestId,
  };
}
