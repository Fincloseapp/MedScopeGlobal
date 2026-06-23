/** OpenAI keys must use sk- prefix (platform.openai.com). */
const OPENAI_KEY_PREFIX = "sk-";

export function isValidOpenAiKey(key: string | undefined | null): boolean {
  const k = key?.trim();
  return Boolean(k && k.startsWith(OPENAI_KEY_PREFIX) && k.length > 20);
}

/**
 * Returns first valid OpenAI API key from env, ignoring misconfigured values
 * (e.g. Google/Vertex keys accidentally set as OPENAI_API_KEY).
 */
export function resolveOpenAiKey(): string | undefined {
  const candidates = [
    process.env.OPENAI_API_KEY,
    process.env.OPEN_API_KEY,
  ];

  for (const raw of candidates) {
    if (isValidOpenAiKey(raw)) return raw!.trim();
  }

  const invalid = candidates.find((c) => c?.trim());
  if (invalid && process.env.NODE_ENV !== "test") {
    const preview = invalid.trim().slice(0, 6);
    console.warn(
      `[MedScopeGlobal] OPENAI_API_KEY/OPEN_API_KEY ignored (invalid format "${preview}…"). Prefer GROQ_API_KEY (gsk_…) from https://console.groq.com — or Gemini/OpenAI sk-….`
    );
  }

  return undefined;
}

export function isOpenAiConfigured(): boolean {
  return Boolean(resolveOpenAiKey());
}
