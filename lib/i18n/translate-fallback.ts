import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import type { LocaleCode } from "@/lib/i18n/config";
import type { TranslatedFields } from "@/lib/i18n/translate-article";

function mymemoryLang(locale: string): string {
  const primary = primaryArticleLocale(locale as LocaleCode);
  if (primary === "zh") return "zh-CN";
  if (primary === "en") return "en";
  return primary;
}

async function translatePlain(
  text: string,
  source: string,
  target: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (source === target) return text;
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", trimmed.slice(0, 450));
  url.searchParams.set("langpair", `${source}|${target}`);
  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(3500),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return text;
    const json = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    const out = json.responseData?.translatedText;
    if (!out || json.responseStatus === 403) return text;
    return out.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  } catch {
    return text;
  }
}

/** Last-resort public MT so DE/FR/EN magazine pages are not left in Czech. */
export async function fallbackTranslateFields(input: {
  title: string;
  excerpt: string | null;
  content?: string;
  sourceLocale: string | null | undefined;
  targetLocale: LocaleCode;
  mode: "card" | "full";
}): Promise<TranslatedFields | null> {
  const source = mymemoryLang(input.sourceLocale || "cs");
  const target = mymemoryLang(input.targetLocale);
  if (source === target) return null;

  const title = await translatePlain(input.title, source, target);
  const excerpt = input.excerpt
    ? await translatePlain(input.excerpt, source, target)
    : null;

  let content = input.content;
  if (input.mode === "full" && input.content) {
    const parts = input.content.split(/(<\/p>)/i);
    const out: string[] = [];
    let translatedBlocks = 0;
    for (const part of parts) {
      if (translatedBlocks >= 8) {
        out.push(part);
        continue;
      }
      const inner = part.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (inner.length < 40 || /<\/p>/i.test(part)) {
        out.push(part);
        continue;
      }
      const translated = await translatePlain(inner, source, target);
      out.push(part.replace(inner, translated));
      translatedBlocks += 1;
    }
    content = out.join("");
  }

  if (title === input.title && excerpt === input.excerpt) return null;

  return {
    title: title.slice(0, 300),
    excerpt: excerpt?.slice(0, 500) ?? input.excerpt,
    content,
    translation_provider: "mymemory",
    machine_translated: true,
    reviewed: false,
  };
}
