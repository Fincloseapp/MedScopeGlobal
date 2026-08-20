const GROQ_LEAK =
  /GROQ_API_KEY|plné redakční zpracování nastavte|Enable <code>GROQ|pro plné AI nastavte GROQ|console\.groq\.com/i;

const AD_ASIDE =
  /<aside\b[^>]*class="[^"]*ms-(?:public|student|pro)-ad[\s\S]*?<\/aside>/gi;

const GROQ_BLOCK =
  /<(p|li|div|h2|h3)\b[^>]*>[\s\S]*?(?:GROQ_API_KEY|plné redakční zpracování nastavte|Enable <code>GROQ|Tento článek byl automaticky zpracován)[\s\S]*?<\/\1>/gi;

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function hasEditorialSetupLeak(text?: string | null): boolean {
  return GROQ_LEAK.test(String(text ?? ""));
}

export function sanitizePublicText(text?: string | null): string {
  const raw = String(text ?? "");
  if (!raw.trim()) return "";
  return raw
    .replace(/\s*Pro plné redakční zpracování nastavte[\s\S]{0,80}/gi, " ")
    .replace(/\s*Enable <code>GROQ_API_KEY<\/code>[\s\S]{0,80}/gi, " ")
    .replace(/\s*Tento článek byl automaticky zpracován[\s\S]{0,180}/gi, " ")
    .replace(/GROQ_API_KEY/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function rebuildSourceBrief(input: {
  title: string;
  excerpt?: string | null;
  source_name?: string | null;
  source_url?: string | null;
}): string {
  const title = String(input.title ?? "").trim();
  const excerptPlain = sanitizePublicText(stripTags(input.excerpt ?? ""));
  const source = escapeHtml(input.source_name?.trim() || "původní zdroj");
  const url = input.source_url?.trim();
  const link = url
    ? `<p><a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">Původní dokument — ${source}</a></p>`
    : `<p>Zdroj: ${source}</p>`;

  const isFoi = /žádost o informace/i.test(title);
  const lead = isFoi
    ? `Jde o oficiální žádost o informace. ${
        excerptPlain
          ? `Předmětem je ${excerptPlain.charAt(0).toLowerCase()}${excerptPlain.slice(1)}.`
          : "Úplné znění je u vydavatele."
      }`
    : excerptPlain ||
      "Oficiální materiál je k dispozici u vydavatele. MedScopeGlobal jej uvádí jako informační přehled.";

  return [
    "<h2>Shrnutí</h2>",
    `<p>${escapeHtml(lead)}</p>`,
    isFoi
      ? "<p>Redakce MedScopeGlobal zde zveřejňuje orientační přehled veřejného dokumentu, nikoli právní rady ani stanovisko úřadu.</p>"
      : "",
    "<h2>Zdroj</h2>",
    link,
    "<p><em>MedScopeGlobal — informační přehled, nenahrazuje lékařskou péči ani rozhodnutí ošetřujícího lékaře.</em></p>",
  ]
    .filter(Boolean)
    .join("");
}

export function sanitizeArticleHtml(
  html: string | null | undefined,
  meta?: {
    title?: string;
    excerpt?: string | null;
    source_name?: string | null;
    source_url?: string | null;
  }
): string {
  let out = String(html ?? "");
  out = out.replace(AD_ASIDE, "");
  out = out.replace(GROQ_BLOCK, "");
  out = out.replace(/GROQ_API_KEY/gi, "");
  out = out.replace(/<code>\s*<\/code>/gi, "");
  out = out.replace(/\n{3,}/g, "\n\n").trim();

  const plain = stripTags(out);
  const tooThin = plain.length < 280 || hasEditorialSetupLeak(plain);
  if (tooThin && meta) {
    return rebuildSourceBrief({
      title: meta.title ?? "",
      excerpt: meta.excerpt || plain,
      source_name: meta.source_name,
      source_url: meta.source_url,
    });
  }
  return out;
}

export function sanitizeArticleFields<
  T extends {
    title: string;
    excerpt?: string | null;
    content?: string | null;
    source_name?: string | null;
    source_url?: string | null;
  },
>(article: T): T {
  const excerpt = sanitizePublicText(article.excerpt);
  const content = sanitizeArticleHtml(article.content, {
    title: article.title,
    excerpt: excerpt || article.excerpt,
    source_name: article.source_name,
    source_url: article.source_url,
  });
  return { ...article, excerpt: excerpt || article.excerpt, content };
}
