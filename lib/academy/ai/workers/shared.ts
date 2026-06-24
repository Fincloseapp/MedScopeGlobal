import {
  generateJsonFromLlm,
  isLlmConfigured,
  resolvePrimaryLlmProvider,
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

  const provider = resolvePrimaryLlmProvider();
  const raw = await generateJsonFromLlm({
    system: input.system,
    user: input.user,
    maxTokens: input.maxTokens ?? 3000,
    temperature: 0.4,
  });

  if (!raw) return { data: null, provider, fallback: true };

  try {
    return { data: JSON.parse(raw) as T, provider, fallback: false };
  } catch {
    return { data: null, provider, fallback: true };
  }
}
