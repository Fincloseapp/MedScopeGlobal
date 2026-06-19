/**
 * Central Groq LLM client — GROQ-only for chat/completions (v47).
 */
import Groq from "groq-sdk";
import {
  groqChatCompletion,
  groqChatCompletionStream,
  groqGenerateJson,
  isGroqConfigured,
  resolveGroqKey,
  type GroqChatOptions,
  type GroqChatResult,
  type GroqMessage,
} from "@/lib/ai/groq";

export const AI_MODEL_PROVIDER = "groq" as const;

export function resolveAiModel(): string {
  return (
    process.env.AI_MODEL?.trim() ||
    process.env.GROQ_MODEL_PRIMARY?.trim() ||
    "llama-3.1-70b-versatile"
  );
}

function createGroqSdk(): Groq | null {
  const apiKey = resolveGroqKey();
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

/** Singleton Groq SDK client (null when GROQ_API_KEY missing). */
export const groq = createGroqSdk();

export { isGroqConfigured, resolveGroqKey };
export type { GroqChatOptions, GroqChatResult, GroqMessage };

export async function groqComplete(input: {
  system?: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  model?: string;
}): Promise<GroqChatResult | null> {
  const messages: GroqMessage[] = [];
  if (input.system?.trim()) {
    messages.push({ role: "system", content: input.system.trim() });
  }
  messages.push({ role: "user", content: input.user });

  return groqChatCompletion({
    messages,
    maxTokens: input.maxTokens ?? 4096,
    temperature: input.temperature ?? 0.3,
    jsonMode: input.jsonMode ?? false,
    model: input.model ?? resolveAiModel(),
  });
}

export async function groqCompleteJson(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}): Promise<string | null> {
  const result = await groqComplete({ ...input, jsonMode: true });
  return result?.content ?? null;
}

export async function groqCompleteStream(
  input: {
    system?: string;
    user: string;
    maxTokens?: number;
    temperature?: number;
    model?: string;
  },
  onChunk?: (text: string) => void
): Promise<GroqChatResult | null> {
  const messages: GroqMessage[] = [];
  if (input.system?.trim()) {
    messages.push({ role: "system", content: input.system.trim() });
  }
  messages.push({ role: "user", content: input.user });

  return groqChatCompletionStream(
    {
      messages,
      maxTokens: input.maxTokens ?? 4096,
      temperature: input.temperature ?? 0.3,
      model: input.model ?? resolveAiModel(),
    },
    onChunk
  );
}

/** SDK streaming via groq-sdk. */
export async function groqSdkStream(input: {
  system?: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}): Promise<string | null> {
  const client = groq ?? createGroqSdk();
  if (!client) return null;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
  if (input.system?.trim()) {
    messages.push({ role: "system", content: input.system.trim() });
  }
  messages.push({ role: "user", content: input.user });

  const stream = await client.chat.completions.create({
    model: input.model ?? resolveAiModel(),
    messages,
    temperature: input.temperature ?? 0.3,
    max_tokens: input.maxTokens ?? 4096,
    stream: true,
  });

  let full = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    if (delta) full += delta;
  }
  return full.trim() || null;
}

export { groqGenerateJson };
