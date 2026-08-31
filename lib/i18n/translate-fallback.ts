import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import type { LocaleCode } from "@/lib/i18n/config";
import type { TranslatedFields } from "@/lib/i18n/translate-article";

function mymemoryLang(locale: string): string {
  const primary = primaryArticleLocale(locale as LocaleCode);
  if (primary === "zh") return "zh-CN";
  if (primary === "en") return "en";
  return primary;
}

function langName(code: string): string {
  const map: Record<string, string> = {
    cs: "czech",
    sk: "slovak",
    pl: "polish",
    de: "german",
    fr: "french",
    es: "spanish",
    it: "italian",
    pt: "portuguese",
    nl: "dutch",
    hu: "hungarian",
    ro: "romanian",
    ru: "russian",
    uk: "ukrainian",
    be: "belarusian",
    en: "english",
    ja: "japanese",
    ko: "korean",
    zh: "chinese",
    "zh-CN": "chinese",
    vi: "vietnamese",
    id: "indonesian",
    ar: "arabic",
    hi: "hindi",
  };
  return map[code] ?? code;
}

async function workersAiTranslate(text: string, source: string, target: string): Promise<string | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const ai = (env as { AI?: { run: (model: string, input: Record<string, string>) => Promise<unknown> } }).AI;
    if (!ai) return null;
    const result = await Promise.race([
      ai.run("@cf/meta/m2m100-1.2b", {
        text: text.slice(0, 1800),
        source_lang: langName(source),
        target_lang: langName(target),
      }),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 2000);
      }),
    ]);
    if (!result) return null;
    if (typeof result === "string" && result.trim()) return result.trim();
    if (typeof result === "object") {
      const rec = result as Record<string, unknown>;
      const out = rec.translated_text ?? rec.translatedText ?? rec.response ?? rec.text;
      if (typeof out === "string" && out.trim()) return out.trim();
    }
    return null;
  } catch {
    return null;
  }
}
let mtQueue: Promise<void> = Promise.resolve();
let mtInFlight = 0;
const MT_CONCURRENCY = 8;

async function withMtSlot<T>(fn: () => Promise<T>): Promise<T> {
  while (mtInFlight >= MT_CONCURRENCY) {
    await mtQueue;
  }
  mtInFlight += 1;
  let release!: () => void;
  const prev = mtQueue;
  mtQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  void prev;
  try {
    return await fn();
  } finally {
    mtInFlight -= 1;
    release();
  }
}

async function gtxTranslate(text: string, source: string, target: string): Promise<string | null> {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", source === "zh-CN" ? "zh-CN" : source);
  url.searchParams.set("tl", target === "zh-CN" ? "zh-CN" : target);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text.slice(0, 1200));
  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(4000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json) || !Array.isArray(json[0])) return null;
    const out = (json[0] as unknown[])
      .map((row) => (Array.isArray(row) ? String(row[0] ?? "") : ""))
      .join("");
    return out.trim() || null;
  } catch {
    return null;
  }
}

async function mymemoryTranslate(text: string, source: string, target: string): Promise<string | null> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 450));
  url.searchParams.set("langpair", `${source}|${target}`);
  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(4000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    const out = json.responseData?.translatedText;
    if (!out || json.responseStatus === 403) return null;
    return out.replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() || null;
  } catch {
    return null;
  }
}

async function translatePlain(
  text: string,
  source: string,
  target: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (source === target) return text;
  return withMtSlot(async () => {
    const local = await workersAiTranslate(trimmed, source, target);
    if (local && local !== trimmed) return local;
    if (process.env.MEDSCOPE_RUNTIME === "cloudflare-workers") {
      return text;
    }
    const gtx = await gtxTranslate(trimmed, source, target);
    if (gtx && gtx !== trimmed) return gtx;
    const memory = await mymemoryTranslate(trimmed, source, target);
    return memory ?? text;
  });
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
  const excerpt =
    input.mode === "full" && input.excerpt
      ? await translatePlain(input.excerpt, source, target)
      : input.excerpt;

  let content = input.content;
  if (input.mode === "full" && input.content) {
    const parts = input.content.split(/(<\/p>)/i);
    const out: string[] = [];
    let translatedBlocks = 0;
    for (const part of parts) {
      if (translatedBlocks >= 3) {
        out.push(part);
        continue;
      }
      const inner = part.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (inner.length < 40 || /<\/p>/i.test(part)) {
        out.push(part);
        continue;
      }
      const translated = await translatePlain(inner.slice(0, 900), source, target);
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
