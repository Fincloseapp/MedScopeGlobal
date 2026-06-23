/** Fix excerpts that end mid-word or mid-sentence in article cards. */
export function normalizeCardExcerpt(excerpt: string | null | undefined, title?: string): string | null {
  if (!excerpt?.trim()) return title ? `${title}.` : null;

  let text = excerpt.replace(/\s+/g, " ").trim();
  if (text.length < 20) return text;

  const endsCleanly = /[.!?…]$/.test(text) || /[)\]"']$/.test(text);
  if (endsCleanly) return text;

  const lastSpace = text.lastIndexOf(" ");
  if (lastSpace > text.length * 0.55) {
    text = text.slice(0, lastSpace).trim();
  }

  if (!/[.!?…]$/.test(text)) {
    text = `${text}…`;
  }

  return text;
}
