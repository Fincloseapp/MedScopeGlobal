/**
 * Groq OpenAI-compatible API client (free tier).
 * https://api.groq.com/openai/v1/chat/completions
 */

export const GROQ_CHAT_COMPLETIONS_URL =
  "https://api.groq.com/openai/v1/chat/completions";

/**
 * Primary + fallbacks (override via GROQ_MODEL_* env).
 * V5 spec aliases (deprecated on Groq API): llama3-70b-8192 → use llama-3.3-70b-versatile,
 * mixtral-8x7b-32768 → llama-3.1-8b-instant, gemma2-27b → openai/gpt-oss-20b.
 */
export const GROQ_MODEL_CHAIN = [
  process.env.GROQ_MODEL_PRIMARY ?? "llama-3.3-70b-versatile",
  process.env.GROQ_MODEL_FALLBACK ?? "llama-3.1-8b-instant",
  process.env.GROQ_MODEL_FALLBACK_2 ?? "openai/gpt-oss-20b",
] as const;

/** Documented V5 legacy IDs (for diagnostics only). */
export const GROQ_LEGACY_MODEL_IDS = [
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "gemma2-27b",
] as const;

const DEFAULT_TIMEOUT_MS = 90_000;

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GroqChatOptions = {
  messages: GroqMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  model?: string;
  timeoutMs?: number;
};

export type GroqChatResult = {
  content: string;
  model: string;
};

export function resolveGroqKey(): string | undefined {
  const k = process.env.GROQ_API_KEY?.trim();
  if (k && k.startsWith("gsk_") && k.length > 20) return k;
  return undefined;
}

export function isGroqConfigured(): boolean {
  return Boolean(resolveGroqKey());
}

let groqKeyWarned = false;

/** Logs once per process when GROQ_API_KEY is missing (server startup / first LLM call). */
export function warnIfGroqKeyMissing(): void {
  if (groqKeyWarned || isGroqConfigured()) return;
  groqKeyWarned = true;
  console.warn(
    "[MedScopeGlobal] GROQ_API_KEY is not set — LLM will fall back to Gemini, OpenAI, or static text. Get a free key at https://console.groq.com/keys"
  );
}

async function groqFetch(
  apiKey: string,
  body: Record<string, unknown>,
  timeoutMs: number
): Promise<Response> {
  return fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
}

function parseChatResponse(
  json: { choices?: { message?: { content?: string } }[] },
  model: string
): GroqChatResult | null {
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) return null;
  return { content, model };
}

/**
 * Chat completion; tries model chain on 4xx model errors.
 */
export async function groqChatCompletion(
  options: GroqChatOptions
): Promise<GroqChatResult | null> {
  const apiKey = resolveGroqKey();
  if (!apiKey) return null;

  const models = options.model
    ? [options.model]
    : [...GROQ_MODEL_CHAIN];
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  for (const model of models) {
    const body: Record<string, unknown> = {
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4096,
    };
    if (options.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    try {
      const res = await groqFetch(apiKey, body, timeoutMs);
      if (res.ok) {
        const json = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const parsed = parseChatResponse(json, model);
        if (parsed) return parsed;
      } else {
        const errText = await res.text();
        console.warn(`[Groq] ${model} failed (${res.status}):`, errText.slice(0, 200));
        if (res.status === 429) {
          await sleep(1500);
        }
      }
    } catch (e) {
      console.warn(`[Groq] ${model} request error:`, e);
    }
  }

  return null;
}

export async function groqGenerateJson(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const result = await groqChatCompletion({
    messages: [
      { role: "system", content: input.system },
      { role: "user", content: input.user },
    ],
    maxTokens: input.maxTokens ?? 4096,
    temperature: input.temperature ?? 0.3,
    jsonMode: true,
  });
  return result?.content ?? null;
}

/**
 * Streaming completion (SSE). Returns aggregated text.
 */
export async function groqChatCompletionStream(
  options: GroqChatOptions,
  onChunk?: (text: string) => void
): Promise<GroqChatResult | null> {
  const apiKey = resolveGroqKey();
  if (!apiKey) return null;

  const model = options.model ?? GROQ_MODEL_CHAIN[0];
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const body: Record<string, unknown> = {
    model,
    messages: options.messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 4096,
    stream: true,
  };
  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  try {
    const res = await groqFetch(apiKey, body, timeoutMs);
    if (!res.ok || !res.body) {
      return groqChatCompletion(options);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const parsed = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
          };
          const chunk = parsed.choices?.[0]?.delta?.content ?? "";
          if (chunk) {
            full += chunk;
            onChunk?.(chunk);
          }
        } catch {
          /* skip malformed SSE */
        }
      }
    }

    if (!full.trim()) return groqChatCompletion(options);
    return { content: full.trim(), model };
  } catch (e) {
    console.warn("[Groq] stream failed, falling back to non-stream:", e);
    return groqChatCompletion(options);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
