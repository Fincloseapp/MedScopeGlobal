import {
  groqComplete,
  groqCompleteJson,
  isGroqConfigured,
  resolveGroqKey,
  resolveAiModel,
  AI_MODEL_PROVIDER,
} from "@/lib/ai/groq-client";
import { warnIfGroqKeyMissing } from "@/lib/ai/groq";
import { isOpenAiConfigured, resolveOpenAiKey } from "@/lib/ai/openai-key";
import { isGeminiConfigured, resolveGeminiKey } from "@/lib/ai/gemini-key";

export { isGroqConfigured, resolveGroqKey, resolveAiModel, AI_MODEL_PROVIDER };

export function isLlmConfigured(): boolean {
  return isGroqConfigured() || isOpenAiConfigured() || isGeminiConfigured();
}

export type LlmProvider = "groq" | "openai" | "gemini" | "none";

export function resolvePrimaryLlmProvider(): LlmProvider {
  if (isGroqConfigured()) return "groq";
  if (isOpenAiConfigured()) return "openai";
  if (isGeminiConfigured()) return "gemini";
  return "none";
}

async function openaiCompleteJson(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      temperature: input.temperature ?? 0.4,
      max_tokens: input.maxTokens ?? 4096,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    console.warn(`[LLM] openai HTTP ${res.status}`);
    return null;
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

async function geminiCompleteJson(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const apiKey = resolveGeminiKey();
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `SYSTEM:\n${input.system}\n\nUSER:\n${input.user}` }],
        },
      ],
      generationConfig: {
        temperature: input.temperature ?? 0.4,
        maxOutputTokens: input.maxTokens ?? 4096,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    console.warn(`[LLM] gemini HTTP ${res.status}`);
    if (res.status === 503 || res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000));
      const retry = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `SYSTEM:\n${input.system}\n\nUSER:\n${input.user}` }] }],
          generationConfig: {
            temperature: input.temperature ?? 0.4,
            maxOutputTokens: input.maxTokens ?? 4096,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(120_000),
      });
      if (retry.ok) {
        const retryData = (await retry.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = retryData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          console.log("[LLM] provider gemini (retry)");
          return text;
        }
      }
    }
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

export async function generateJsonFromLlmWithMeta(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{ content: string | null; provider: LlmProvider }> {
  if (isGroqConfigured()) {
    warnIfGroqKeyMissing();
    const groq = await groqCompleteJson(input);
    if (groq) {
      console.log("[LLM] provider groq");
      return { content: groq, provider: "groq" };
    }
    console.warn("[LLM] Groq chain exhausted — trying secondary providers");
  }

  const openai = await openaiCompleteJson(input);
  if (openai) {
    console.log("[LLM] provider openai");
    return { content: openai, provider: "openai" };
  }

  const gemini = await geminiCompleteJson(input);
  if (gemini) {
    console.log("[LLM] provider gemini");
    return { content: gemini, provider: "gemini" };
  }

  return { content: null, provider: "none" };
}

export async function generateJsonFromLlm(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const { content } = await generateJsonFromLlmWithMeta(input);
  return content;
}

export async function generateTextFromLlm(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  warnIfGroqKeyMissing();
  const result = await groqComplete({ ...input, jsonMode: false });
  if (result?.content) return result.content;

  const json = await openaiCompleteJson({ ...input, system: input.system ?? "" });
  if (json) return json;

  return geminiCompleteJson({ ...input, system: input.system ?? "" });
}
