import { isAiConfigured, resolveOpenAiKey } from "@/lib/ingestion/ai";
import {
  matchesArticleLocale,
  primaryArticleLocale,
} from "@/lib/i18n/article-locale";
import type { LocaleCode } from "@/lib/i18n/config";
import { createServiceRoleClient } from "@/lib/supabase/service";

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
  const target = primaryArticleLocale(targetLocale);
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("article_translations")
    .select("title, excerpt, content, translation_provider, machine_translated, reviewed")
    .eq("article_id", articleId)
    .eq("locale", target)
    .maybeSingle();

  if (error?.code === "PGRST205" || error?.message?.includes("article_translations")) {
    return null;
  }
  if (!data) return null;
  return {
    title: data.title as string,
    excerpt: (data.excerpt as string | null) ?? null,
    content: data.content as string | undefined,
    translation_provider: (data.translation_provider as string | null) ?? undefined,
    machine_translated: (data.machine_translated as boolean | null) ?? undefined,
    reviewed: (data.reviewed as boolean | null) ?? undefined,
  };
}

export async function saveCachedTranslation(
  articleId: string,
  targetLocale: LocaleCode,
  fields: TranslatedFields
) {
  const target = primaryArticleLocale(targetLocale);
  const admin = createServiceRoleClient();
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

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const key = resolveOpenAiKey();
  if (!key) return null;

  const body =
    input.mode === "card"
      ? `Translate to ${target} (medical journalism, accurate terminology). Return JSON: {"title":"...","excerpt":"..."}
Title: ${input.title}
Excerpt: ${input.excerpt ?? ""}`
      : `Translate to ${target} (medical journalism). Preserve HTML structure. Return JSON: {"title":"...","excerpt":"...","content":"..."}
Title: ${input.title}
Excerpt: ${input.excerpt ?? ""}
Content HTML: ${(input.content ?? "").slice(0, 12000)}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a medical translator. Output valid JSON only. Do not invent clinical facts.",
          },
          { role: "user", content: body },
        ],
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TranslatedFields;
    return {
      title: parsed.title?.slice(0, 300) ?? input.title,
      excerpt: parsed.excerpt?.slice(0, 500) ?? input.excerpt,
      content: parsed.content ?? input.content,
      translation_provider: "openai",
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

export async function resolveArticleTranslation(
  articleId: string,
  fields: {
    title: string;
    excerpt: string | null;
    content: string;
    locale?: string | null;
  },
  uiLocale: LocaleCode,
  mode: "card" | "full"
): Promise<TranslatedFields | null> {
  if (matchesArticleLocale(fields.locale, uiLocale)) return null;

  const cached = await getCachedTranslation(articleId, uiLocale);
  if (cached) {
    if (mode === "card") return { title: cached.title, excerpt: cached.excerpt };
    return cached;
  }

  let translated: TranslatedFields | null = null;

  // Try OpenAI first
  translated = await translateArticleFields({
    title: fields.title,
    excerpt: fields.excerpt,
    content: fields.content,
    sourceLocale: fields.locale,
    targetLocale: uiLocale,
    mode,
  }).catch(() => null);

  // If OpenAI not available or returned null, try Google Translate fallback
  if (!translated && process.env.GOOGLE_TRANSLATE_KEY) {
    const target = primaryArticleLocale(uiLocale);
    try {
      translated = await googleTranslateFields(
        { title: fields.title, excerpt: fields.excerpt, content: fields.content },
        target,
        process.env.GOOGLE_TRANSLATE_KEY
      );
    } catch {
      translated = null;
    }
  }

  if (translated) {
    await saveCachedTranslation(articleId, uiLocale, {
      ...translated,
      content: mode === "full" ? translated.content : undefined,
    }).catch(() => {});
  }

  return translated;
}
