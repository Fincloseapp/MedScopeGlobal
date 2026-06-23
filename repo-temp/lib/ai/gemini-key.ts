/** Google AI Studio / Gemini keys: AIza… (legacy) or AQ.… (new). */
export function isValidGeminiKey(key: string | undefined | null): boolean {
  const k = key?.trim();
  return Boolean(
    k &&
      k.length > 20 &&
      (k.startsWith("AIza") || k.startsWith("AQ."))
  );
}

export function resolveGeminiKey(): string | undefined {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_AI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  ];

  for (const raw of candidates) {
    if (isValidGeminiKey(raw)) return raw!.trim();
  }

  return undefined;
}

export function isGeminiConfigured(): boolean {
  return Boolean(resolveGeminiKey());
}
