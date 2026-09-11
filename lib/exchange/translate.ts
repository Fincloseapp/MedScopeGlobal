import { translateText } from "@/lib/v47/translation/engine";

const DEEPL_LANG: Record<string, string> = {
  cs: "CS",
  en: "EN",
  "en-US": "EN-US",
  "en-UK": "EN-GB",
  de: "DE",
  fr: "FR",
  it: "IT",
  es: "ES",
  pl: "PL",
  sk: "SK",
  hu: "HU",
  pt: "PT-PT",
  "pt-BR": "PT-BR",
  nl: "NL",
  ja: "JA",
  ko: "KO",
  "zh-CN": "ZH",
  ru: "RU",
  uk: "UK",
};

export type ExchangeTranslation = {
  ok: boolean;
  translation: string;
  provider: "deepl" | "groq" | "manual" | "passthrough";
  targetLocale: string;
  error?: string;
};

function deeplEndpoint(): string {
  const key = process.env.DEEPL_API_KEY?.trim();
  if (!key) return "";
  if (process.env.DEEPL_API_URL?.trim()) return process.env.DEEPL_API_URL.trim();
  return key.endsWith(":fx") || key.includes("free")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
}

async function translateWithDeepL(
  text: string,
  sourceLocale: string | undefined,
  targetLocale: string
): Promise<ExchangeTranslation | null> {
  const key = process.env.DEEPL_API_KEY?.trim();
  const endpoint = deeplEndpoint();
  if (!key || !endpoint) return null;
  const target = DEEPL_LANG[targetLocale] ?? DEEPL_LANG[targetLocale.split("-")[0] ?? ""] ?? targetLocale.toUpperCase();
  const source = sourceLocale
    ? DEEPL_LANG[sourceLocale] ?? DEEPL_LANG[sourceLocale.split("-")[0] ?? ""]
    : undefined;
  try {
    const body = new URLSearchParams();
    body.set("text", text.slice(0, 8000));
    body.set("target_lang", target);
    if (source) body.set("source_lang", source.split("-")[0] ?? source);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { translations?: { text?: string }[] };
    const translation = json.translations?.[0]?.text;
    if (!translation) return null;
    return { ok: true, translation, provider: "deepl", targetLocale };
  } catch {
    return null;
  }
}

export async function translateExchangeText(input: {
  text: string;
  sourceLocale?: string;
  targetLocale: string;
}): Promise<ExchangeTranslation> {
  const text = input.text.trim();
  const target = input.targetLocale.trim();
  if (!text || !target) {
    return { ok: false, translation: text, provider: "passthrough", targetLocale: target, error: "missing_input" };
  }
  if (input.sourceLocale && input.sourceLocale.split("-")[0] === target.split("-")[0]) {
    return { ok: true, translation: text, provider: "passthrough", targetLocale: target };
  }

  const deepl = await translateWithDeepL(text, input.sourceLocale, target);
  if (deepl) return deepl;

  const groq = await translateText({
    text,
    sourceLocale: input.sourceLocale,
    targetLocale: target.split("-")[0] ?? target,
  });
  if (groq.ok) {
    return { ok: true, translation: groq.translation, provider: "groq", targetLocale: target };
  }
  return {
    ok: false,
    translation: text,
    provider: "passthrough",
    targetLocale: target,
    error: groq.error ?? "translation_unavailable",
  };
}

export async function translateListingFields(input: {
  title: string;
  summary: string;
  description: string;
  sourceLocale: string;
  targetLocale: string;
}) {
  const [title, summary, description] = await Promise.all([
    translateExchangeText({ text: input.title, sourceLocale: input.sourceLocale, targetLocale: input.targetLocale }),
    translateExchangeText({ text: input.summary, sourceLocale: input.sourceLocale, targetLocale: input.targetLocale }),
    translateExchangeText({
      text: input.description,
      sourceLocale: input.sourceLocale,
      targetLocale: input.targetLocale,
    }),
  ]);
  return { title, summary, description };
}
