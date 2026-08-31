import { isAiConfigured } from "@/lib/ingestion/ai";
import { generateJsonFromLlm } from "@/lib/ai/chat-json";
import {
  matchesArticleLocale,
  primaryArticleLocale,
} from "@/lib/i18n/article-locale";
import { isUsableTargetText, looksLikeCzech } from "@/lib/i18n/czech-detect";
import type { LocaleCode } from "@/lib/i18n/config";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export interface TranslatedFields {
  title: string;
  excerpt: string | null;
  content?: string;
  translation_provider?: string;
  machine_translated?: boolean;
  reviewed?: boolean;
}

export async function getCachedTranslation(
  articleId: string,
  targetLocale: LocaleCode
): Promise<TranslatedFields | null> {
  const map = await getCachedTranslations([articleId], targetLocale);
  return map.get(articleId) ?? null;
}

export async function getCachedTranslations(
  articleIds: string[],
  targetLocale: LocaleCode
): Promise<Map<string, TranslatedFields>> {
  const out = new Map<string, TranslatedFields>();
  if (articleIds.length === 0) return out;
  const admin = tryCreateServiceRoleClient();
  if (!admin) return out;
  const target = primaryArticleLocale(targetLocale);
  try {
    const { data, error } = await admin
      .from("article_translations")
      .select("article_id, title, excerpt, content, translation_provider, machine_translated, reviewed")
      .in("article_id", articleIds)
      .eq("locale", target);
    if (error || !data) return out;
    for (const row of data) {
      out.set(row.article_id as string, {
        title: row.title as string,
        excerpt: (row.excerpt as string | null) ?? null,
        content: (row.content as string | undefined) ?? undefined,
        translation_provider: (row.translation_provider as string | null) ?? undefined,
        machine_translated: (row.machine_translated as boolean | null) ?? undefined,
        reviewed: (row.reviewed as boolean | null) ?? undefined,
      });
    }
  } catch {
    return out;
  }
  return out;
}

export async function saveCachedTranslation(
  articleId: string,
  targetLocale: LocaleCode,
  fields: TranslatedFields
) {
  const target = primaryArticleLocale(targetLocale);
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  try {
    await admin.from("article_translations").upsert(
      {
        article_id: articleId,
        locale: target,
        title: fields.title,
        excerpt: fields.excerpt,
        content: fields.content ?? null,
        translation_provider: fields.translation_provider ?? null,
        machine_translated: fields.machine_translated ?? true,
        reviewed: fields.reviewed ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "article_id,locale" }
    );
  } catch (e) {
    // If migration not applied or column missing, ignore write errors
  }
}

export async function translateArticleFields(input: {
  title: string;
  excerpt: string | null;
  content?: string;
  sourceLocale: string | null | undefined;
  targetLocale: LocaleCode;
  mode: "card" | "full";
}): Promise<TranslatedFields | null> {
  if (!isAiConfigured()) return null;

  const target = primaryArticleLocale(input.targetLocale);
  const source = input.sourceLocale ?? "en";
  if (source === target || matchesArticleLocale(source, input.targetLocale)) {
    return null;
  }

  const body =
    input.mode === "card"
      ? `Translate to ${target} (medical journalism, accurate terminology). Return JSON: {"title":"...","excerpt":"..."}
Title: ${input.title}
Excerpt: ${input.excerpt ?? ""}`
      : `Translate to ${target} (medical journalism). Preserve HTML structure. Return JSON: {"title":"...","excerpt":"...","content":"..."}
Title: ${input.title}
Excerpt: ${input.excerpt ?? ""}
Content HTML: ${(input.content ?? "").slice(0, 3500)}`;

  try {
    const raw = await Promise.race([
      generateJsonFromLlm({
        system: "You are a medical translator. Output valid JSON only. Do not invent clinical facts.",
        user: body,
        temperature: 0.2,
        maxTokens: input.mode === "card" ? 800 : 4096,
      }),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), input.mode === "card" ? 6000 : 9000);
      }),
    ]);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TranslatedFields;
    const title = parsed.title?.trim() ? parsed.title.slice(0, 300) : "";
    if (!title) return null;
    return {
      title,
      excerpt: parsed.excerpt?.trim() ? parsed.excerpt.slice(0, 500) : input.excerpt,
      content: parsed.content ?? input.content,
      translation_provider: "groq",
      machine_translated: true,
      reviewed: false,
    };
  } catch {
    return null;
  }
}

async function googleTranslateText(
  text: string,
  target: string,
  apiKey: string,
  format: "text" | "html" = "text"
) {
  if (!text) return text;
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target, format }),
        signal: AbortSignal.timeout(60_000),
      }
    );
    if (!res.ok) return text;
    const json = await res.json();
    const translated = json.data?.translations?.[0]?.translatedText;
    return translated ?? text;
  } catch {
    return text;
  }
}

// Google fallback helper that translates fields and returns TranslatedFields
async function googleTranslateFields(
  input: {
    title: string;
    excerpt: string | null;
    content?: string;
  },
  target: string,
  apiKey: string
): Promise<TranslatedFields> {
  const title = await googleTranslateText(input.title, target, apiKey, "text");
  const excerpt = input.excerpt
    ? await googleTranslateText(input.excerpt, target, apiKey, "text")
    : null;
  const content = input.content
    ? await googleTranslateText(input.content, target, apiKey, "html")
    : undefined;
  return {
    title: title?.slice(0, 300) ?? input.title,
    excerpt: excerpt?.slice(0, 500) ?? input.excerpt,
    content: content ?? input.content,
    translation_provider: "google",
    machine_translated: true,
    reviewed: false,
  };
}

function mergeTranslation(
  cached: TranslatedFields | null | undefined,
  live: TranslatedFields | null | undefined,
  target: string,
  mode: "card" | "full"
): TranslatedFields | null {
  const title = isUsableTargetText(live?.title, target)
    ? live!.title
    : isUsableTargetText(cached?.title, target)
      ? cached!.title
      : (live?.title?.trim() || cached?.title?.trim() || "");
  if (!title) return null;

  const excerpt = isUsableTargetText(live?.excerpt, target)
    ? live!.excerpt ?? null
    : isUsableTargetText(cached?.excerpt, target)
      ? cached!.excerpt ?? null
      : live?.excerpt ?? cached?.excerpt ?? null;

  let content =
    mode === "full"
      ? isUsableTargetText(live?.content, target)
        ? live!.content
        : isUsableTargetText(cached?.content, target)
          ? cached!.content
          : live?.content ?? cached?.content
      : undefined;

  if (mode === "full" && target !== "cs" && looksLikeCzech(content)) {
    content = excerpt && !looksLikeCzech(excerpt) ? `<p>${excerpt}</p>` : "";
  }

  return {
    title,
    excerpt,
    content,
    translation_provider: live?.translation_provider ?? cached?.translation_provider,
    machine_translated: live?.machine_translated ?? cached?.machine_translated ?? true,
    reviewed: cached?.reviewed ?? false,
  };
}

export async function resolveArticleTranslation(
  articleId: string,
  fields: {
    title: string;
    excerpt: string | null;
    content: string;
    locale?: string | null;
  },
  uiLocale: LocaleCode,
  mode: "card" | "full",
  options?: { live?: boolean }
): Promise<TranslatedFields | null> {
  if (matchesArticleLocale(fields.locale, uiLocale)) return null;

  const target = primaryArticleLocale(uiLocale);
  const cached = await getCachedTranslation(articleId, uiLocale);
  const cacheTitleOk = isUsableTargetText(cached?.title, target);
  const cacheBodyOk =
    mode === "card" ||
    isUsableTargetText(cached?.content, target) ||
    (target === "cs" && Boolean(cached?.content));

  if (mode === "card" && cacheTitleOk) {
    return {
      title: cached!.title,
      excerpt: cached!.excerpt,
      translation_provider: cached!.translation_provider,
      machine_translated: cached!.machine_translated ?? true,
      reviewed: cached!.reviewed,
    };
  }
  if (mode === "full" && cacheTitleOk && cacheBodyOk) {
    return cached;
  }

  if (options?.live === false && mode === "card") {
    return cacheTitleOk ? cached : null;
  }

  const { fallbackTranslateFields } = await import("@/lib/i18n/translate-fallback");

  // Title first so a full-body timeout can never blank the H1.
  let live: TranslatedFields | null = null;
  if (!cacheTitleOk) {
    live = await fallbackTranslateFields({
      title: fields.title,
      excerpt: fields.excerpt,
      content: fields.content,
      sourceLocale: fields.locale ?? "cs",
      targetLocale: uiLocale,
      mode: "card",
    }).catch(() => null);
  }

  if (mode === "full" && !cacheBodyOk) {
    const body = await fallbackTranslateFields({
      title: fields.title,
      excerpt: fields.excerpt,
      content: fields.content,
      sourceLocale: fields.locale ?? "cs",
      targetLocale: uiLocale,
      mode: "full",
      deadlineMs: 7500,
      maxBlocks: 12,
    }).catch(() => null);
    live = mergeTranslation(live ?? cached, body, target, "full") ?? body ?? live;
  }

  if (!isUsableTargetText(live?.title ?? cached?.title, target)) {
    const llm = await translateArticleFields({
      title: fields.title,
      excerpt: fields.excerpt,
      content: mode === "card" ? undefined : fields.content,
      sourceLocale: fields.locale,
      targetLocale: uiLocale,
      mode: "card",
    }).catch(() => null);
    if (llm) live = mergeTranslation(live ?? cached, llm, target, mode) ?? llm;
  }

  if (
    !isUsableTargetText(live?.title ?? cached?.title, target) &&
    process.env.GOOGLE_TRANSLATE_KEY
  ) {
    try {
      const google = await googleTranslateFields(
        {
          title: fields.title,
          excerpt: fields.excerpt,
          content: mode === "full" ? fields.content : undefined,
        },
        target,
        process.env.GOOGLE_TRANSLATE_KEY
      );
      live = mergeTranslation(live ?? cached, google, target, mode) ?? google;
    } catch {
      /* ignore */
    }
  }

  const merged = mergeTranslation(cached, live, target, mode);
  if (merged && isUsableTargetText(merged.title, target)) {
    await saveCachedTranslation(articleId, uiLocale, {
      ...merged,
      content: mode === "full" ? merged.content : cached?.content ?? merged.content,
    }).catch(() => {});
  }

  return merged;
}

/** One Groq call for many listing cards — avoids N sequential LLM timeouts on Workers. */
export async function translateCardsBatch(
  items: { id: string; title: string; excerpt: string | null; locale?: string | null }[],
  uiLocale: LocaleCode
): Promise<Map<string, TranslatedFields>> {
  const out = new Map<string, TranslatedFields>();
  if (items.length === 0 || !isAiConfigured()) return out;

  const target = primaryArticleLocale(uiLocale);
  const limited = items.slice(0, 24);

  for (let offset = 0; offset < limited.length; offset += 12) {
    const chunk = limited.slice(offset, offset + 12);
    const payload = chunk.map((item, index) => ({
      i: index,
      title: item.title.slice(0, 220),
      excerpt: (item.excerpt ?? "").slice(0, 280),
    }));
    try {
      const raw = await Promise.race([
        generateJsonFromLlm({
          system:
            "You are a medical translator. Output valid JSON only. Do not invent clinical facts.",
          user: `Translate each item to ${target} (medical journalism). Return {"items":[{"i":0,"title":"...","excerpt":"..."}]}
${JSON.stringify(payload)}`,
          temperature: 0.15,
          maxTokens: 2800,
        }),
        new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 8000);
        }),
      ]);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as {
        items?: { i?: number; title?: string; excerpt?: string }[];
      };
      for (const row of parsed.items ?? []) {
        const index = typeof row.i === "number" ? row.i : -1;
        const source = chunk[index];
        if (!source || !row.title) continue;
        const fields: TranslatedFields = {
          title: row.title.slice(0, 300),
          excerpt: row.excerpt?.slice(0, 500) ?? source.excerpt,
          translation_provider: "groq",
          machine_translated: true,
          reviewed: false,
        };
        out.set(source.id, fields);
        void saveCachedTranslation(source.id, uiLocale, fields);
      }
    } catch {
      continue;
    }
  }
  return out;
}
