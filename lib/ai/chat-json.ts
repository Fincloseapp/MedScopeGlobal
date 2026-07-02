import {
  groqComplete,
  groqCompleteJson,
  isGroqConfigured,
  resolveGroqKey,
  resolveAiModel,
  AI_MODEL_PROVIDER,
} from "@/lib/ai/groq-client";
import { warnIfGroqKeyMissing } from "@/lib/ai/groq";

export { isGroqConfigured, resolveGroqKey, resolveAiModel, AI_MODEL_PROVIDER };

/** GROQ-only — no OpenAI/Gemini/Anthropic fallbacks for chat/completions. */
export function isLlmConfigured(): boolean {
  return isGroqConfigured();
}

export type LlmProvider = "groq" | "none";

export function resolvePrimaryLlmProvider(): LlmProvider {
  return isGroqConfigured() ? "groq" : "none";
}

export async function generateJsonFromLlm(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  warnIfGroqKeyMissing();
  return groqCompleteJson(input);
}

export async function generateTextFromLlm(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  warnIfGroqKeyMissing();
  const result = await groqComplete({ ...input, jsonMode: false });
  return result?.content ?? null;
}
