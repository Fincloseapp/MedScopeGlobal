import {
  groqChatCompletion,
  groqGenerateJson,
  isGroqConfigured,
  warnIfGroqKeyMissing,
} from "@/lib/ai/groq";
import { resolveGeminiKey } from "@/lib/ai/gemini-key";
import { resolveOpenAiKey } from "@/lib/ai/openai-key";

export { isGroqConfigured, resolveGroqKey } from "@/lib/ai/groq";

/**
 * V5 priority: Groq → Gemini → OpenAI (no OpenAI-first when Groq is set).
 */
export function isLlmConfigured(): boolean {
  return Boolean(isGroqConfigured() || resolveGeminiKey() || resolveOpenAiKey());
}

export type LlmProvider = "groq" | "gemini" | "openai" | "none";

export function resolvePrimaryLlmProvider(): LlmProvider {
  if (isGroqConfigured()) return "groq";
  if (resolveGeminiKey()) return "gemini";
  if (resolveOpenAiKey()) return "openai";
  return "none";
}

/**
 * Returns model text (expected JSON).
 * Chain: Groq (llama3 → mixtral → gemma2) → Gemini → OpenAI.
 */
export async function generateJsonFromLlm(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  warnIfGroqKeyMissing();

  const groq = await groqGenerateJson(input);
  if (groq) return groq;

  const gemini = await generateJsonFromGemini(input);
  if (gemini) return gemini;

  return generateJsonFromOpenAi(input);
}

/** Plain-text completion: Groq → Gemini → OpenAI. */
export async function generateTextFromLlm(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  warnIfGroqKeyMissing();

  const groq = await groqChatCompletion({
    messages: [
      { role: "system", content: input.system },
      { role: "user", content: input.user },
    ],
    maxTokens: input.maxTokens ?? 2000,
    temperature: input.temperature ?? 0.3,
    jsonMode: false,
  });
  if (groq?.content) return groq.content;

  const geminiRaw = await generateJsonFromGemini({
    ...input,
    system: `${input.system}\nOdpověz pouze prostým textem, ne JSON.`,
    user: input.user,
  });
  if (geminiRaw) {
    try {
      const p = JSON.parse(geminiRaw) as { text?: string; reply?: string };
      return p.text ?? p.reply ?? geminiRaw;
    } catch {
      return geminiRaw;
    }
  }

  const openaiKey = resolveOpenAiKey();
  if (!openaiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: input.temperature ?? 0.3,
        max_tokens: input.maxTokens ?? 2000,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return json.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

async function generateJsonFromOpenAi(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const openaiKey = resolveOpenAiKey();
  if (!openaiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: input.temperature ?? 0.3,
        response_format: { type: "json_object" },
        max_tokens: input.maxTokens ?? 4096,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      console.error("OpenAI error", await res.text());
      return null;
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return json.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.error("OpenAI request failed", e);
    return null;
  }
}

async function generateJsonFromGemini(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const key = resolveGeminiKey();
  if (!key) return null;

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.system }] },
        contents: [{ role: "user", parts: [{ text: input.user }] }],
        generationConfig: {
          temperature: input.temperature ?? 0.3,
          maxOutputTokens: input.maxTokens ?? 4096,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      console.error("Gemini error", await res.text());
      return null;
    }

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (e) {
    console.error("Gemini request failed", e);
    return null;
  }
}
