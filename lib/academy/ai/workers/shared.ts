import {
  generateJsonFromAllLlmProviders,
  isLlmConfigured,
  type LlmProvider,
} from "@/lib/ai/chat-json";

export async function academyGenerateJson<T>(input: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<{ data: T | null; provider: LlmProvider; fallback: boolean }> {
  if (!isLlmConfigured()) {
    return { data: null, provider: "none", fallback: true };
  }

  const { data, provider } = await generateJsonFromAllLlmProviders<T>({
    system: input.system,
    user: input.user,
    maxTokens: input.maxTokens ?? 3000,
    temperature: 0.4,
  });

  if (!data) return { data: null, provider, fallback: true };
  return { data, provider, fallback: false };
}
