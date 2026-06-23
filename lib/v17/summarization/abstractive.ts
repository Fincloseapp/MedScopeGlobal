/** V17 abstractive summarization — condensed single-line summary. */
export async function summarizeAbstractive(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 24) return trimmed;
  return `${words.slice(0, 24).join(" ")}…`;
}
