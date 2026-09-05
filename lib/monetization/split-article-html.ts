/** Insert a quiet mid-article slot after the first few paragraphs. */
export function splitHtmlAfterParagraphs(html: string, afterParagraphs = 2): [string, string] {
  if (!html || afterParagraphs < 1) return [html, ""];
  const re = /<\/p>/gi;
  let count = 0;
  let cut = -1;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    count += 1;
    if (count >= afterParagraphs) {
      cut = match.index + match[0].length;
      break;
    }
  }
  if (cut < 0) return [html, ""];
  const rest = html.slice(cut);
  if (!rest.trim()) return [html, ""];
  return [html.slice(0, cut), rest];
}
