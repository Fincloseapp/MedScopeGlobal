/** V17 extractive summarization — lead sentences from source text. */
export async function summarizeExtractive(text: string): Promise<string[]> {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}
