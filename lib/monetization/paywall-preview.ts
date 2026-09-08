/** Characters of article HTML shown before a paywall gate. */
export const PAYWALL_PREVIEW_CHARS = 720;

/** Plain-text teaser for paywall preview */
export function getPaywallPreviewText(html: string, maxChars = PAYWALL_PREVIEW_CHARS): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice).trim();
}

/** Truncated HTML for rendered paywall preview (keeps opening paragraphs) */
export function getPaywallPreviewHtml(html: string, maxChars = PAYWALL_PREVIEW_CHARS): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return html;

  let acc = 0;
  const blockRe = /(<(?:p|h[1-6]|li|blockquote|div)[^>]*>[\s\S]*?<\/(?:p|h[1-6]|li|blockquote|div)>)/gi;
  let match: RegExpExecArray | null;
  const blocks: string[] = [];

  while ((match = blockRe.exec(html)) !== null) {
    const block = match[1];
    const blockText = block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!blockText) continue;
    if (acc + blockText.length > maxChars && blocks.length > 0) break;
    blocks.push(block);
    acc += blockText.length;
    if (acc >= maxChars) break;
  }

  if (blocks.length > 0) return blocks.join("\n");

  const previewText = getPaywallPreviewText(html, maxChars);
  return `<p>${previewText}…</p>`;
}

function htmlToPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export type ArticleRemainder = {
  remainingPct: number;
  headings: string[];
};

/** How much of the article sits behind the teaser, plus unread headings. */
export function getArticleRemainder(
  html: string,
  maxChars = PAYWALL_PREVIEW_CHARS
): ArticleRemainder {
  const text = htmlToPlainText(html);
  if (!text) return { remainingPct: 0, headings: [] };

  const remainingChars = Math.max(0, text.length - maxChars);
  const remainingPct =
    remainingChars === 0
      ? 0
      : Math.min(99, Math.max(1, Math.round((remainingChars / text.length) * 100)));

  const headings: string[] = [];
  const headingRe = /<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html)) !== null) {
    const heading = htmlToPlainText(match[1] ?? "");
    if (heading.length < 3) continue;
    const idx = text.indexOf(heading);
    if (idx === -1 || idx >= maxChars) headings.push(heading);
  }

  if (headings.length === 0 && remainingChars > 0) {
    const clips = text
      .slice(maxChars)
      .split(/(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 24)
      .slice(0, 3)
      .map((part) => (part.length > 88 ? `${part.slice(0, 85)}…` : part));
    return { remainingPct, headings: clips };
  }

  return { remainingPct, headings: headings.slice(0, 6) };
}
