import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";

const SUPPORTED_LOCALES = [
  "cs", "en", "de", "fr", "es", "it", "pl", "sk", "hu", "ro", "bg", "hr", "sl",
  "nl", "pt", "sv", "da", "fi", "no", "el", "tr", "ru", "uk", "ar", "he", "hi",
  "zh", "ja", "ko", "th", "vi", "id", "ms", "tl", "bn", "ta", "te", "mr", "gu",
  "kn", "ml", "pa", "ur", "fa", "sw", "am", "ha", "yo", "zu", "af", "sq", "sr",
  "mk", "lt", "lv", "et", "is", "ga", "cy", "mt", "lb",
] as const;

export type TranslateInput = {
  text: string;
  sourceLocale?: string;
  targetLocale: string;
};

export async function translateText(input: TranslateInput) {
  if (!isGroqConfigured()) {
    return { ok: false as const, error: "GROQ_API_KEY not configured", scaffold: true };
  }

  const target = input.targetLocale.trim().toLowerCase();
  if (!SUPPORTED_LOCALES.includes(target as (typeof SUPPORTED_LOCALES)[number])) {
    return { ok: false as const, error: `Unsupported locale: ${target}` };
  }

  const raw = await groqCompleteJson({
    system: "You are a medical translator. Return JSON only: {\"translation\":\"...\"}",
    user: `Translate from ${input.sourceLocale ?? "auto"} to ${target}:\n${input.text.slice(0, 8000)}`,
    temperature: 0.2,
  });

  if (!raw) {
    return { ok: false as const, error: "Translation failed" };
  }

  try {
    const parsed = JSON.parse(raw) as { translation?: string };
    return {
      ok: true as const,
      translation: parsed.translation ?? input.text,
      targetLocale: target,
      model: resolveAiModel(),
      provider: "groq" as const,
    };
  } catch {
    return { ok: true as const, translation: raw, targetLocale: target, model: resolveAiModel(), provider: "groq" as const };
  }
}

export { SUPPORTED_LOCALES };
