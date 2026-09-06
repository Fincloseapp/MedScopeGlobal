/**
 * Display-time magazine desk polish for Czech cards and article bodies.
 * Overrides win over generic slop stripping so homepage + /articles stay
 * editorial even when the database still holds writer-template copy.
 */
import { MAGAZINE_DESK_OVERRIDES } from "@/lib/editorial/magazine-desk-overrides";
import {
  anonymizeClinicianNames,
  publicArticleSlug,
} from "@/lib/editorial/clinician-anonymize";

const TEMPLATE_PHRASE_RE =
  /srozumitelně a bez zbytečného strašení|srozumitelný průvodce pro každého(?:[^.]*chce)?|bez zbytečného strašení|praktické rady pro každého|zjistěte,?\s+jak|přečtěte si|čtěte o tom|přijďte zjistit|v tomto článku (?:najdete|se podíváme|se dozvíte)|pojďme se podívat/gi;

const TITLE_ECHO_RE = /^(prevence|nemoci|životní styl|rozhovory)\s*[:·—–-]\s*/i;

export function polishMagazineTitle(title: string): string {
  let t = String(title ?? "")
    .replace(/\búspech/gi, "úspěch")
    .replace(/\bkdy exactly\b/gi, "kdy")
    .replace(/\s+/g, " ")
    .trim();

  t = collapseRepeatedChunks(t, /[—–·|]/);
  t = collapseRepeatedChunks(t, /:/);
  t = t.replace(TEMPLATE_PHRASE_RE, " ").replace(/\s+/g, " ").trim();
  t = t.replace(TITLE_ECHO_RE, "").trim();
  t = t.replace(/^[:·—–-]\s*/, "").replace(/\s+[:·—–-]$/, "").trim();
  t = t.replace(/\s{2,}/g, " ").replace(/\s+([:.,!?])/g, "$1");
  return t.replace(/^./, (ch) => ch.toLocaleUpperCase("cs-CZ"));
}

export function polishMagazineExcerpt(excerpt: string | null | undefined, title: string): string {
  const cleanTitle = polishMagazineTitle(title);
  let text = String(excerpt ?? "")
    .replace(/\búspech/gi, "úspěch")
    .replace(/\bkdy exactly\b/gi, "kdy")
    .replace(/\s+/g, " ")
    .trim();

  text = text.replace(TEMPLATE_PHRASE_RE, " ").replace(/\s+/g, " ").trim();
  text = collapseRepeatedChunks(text, /[—–·]/);
  text = text.replace(new RegExp(`^(${escapeRegExp(cleanTitle)})(?:\\s*[—–:]\\s*\\1)+`, "i"), "$1");

  const titleCore = cleanTitle.replace(/[?!.]/g, "").trim();
  if (titleCore && text.toLocaleLowerCase("cs-CZ").startsWith(titleCore.toLocaleLowerCase("cs-CZ"))) {
    const rest = text.slice(titleCore.length).replace(/^[\s—–:.,-]+/, "").trim();
    if (rest.length >= 40) text = rest;
  }

  text = text.replace(/\s{2,}/g, " ").replace(/\s+([:.,!?])/g, "$1").trim();
  if (!text || text.length < 40 || almostRepeatsTitle(text, cleanTitle)) {
    return `${cleanTitle.replace(/[?!.]$/, "")}. Redakční přehled pro české čtenáře — konkrétní signály, postup a kdy jít k lékaři.`;
  }
  if (!/[.!?…]$/.test(text)) {
    const cut = text.lastIndexOf(" ");
    text = `${(cut > 80 ? text.slice(0, cut) : text).trim()}…`;
  }
  return text.slice(0, 480);
}

export function stripEditorialChrome(html: string): string {
  return String(html ?? "")
    .replace(/<p class="article-byline"[^>]*>[\s\S]*?<\/p>/gi, "")
    .replace(/AI-asistovaná syntéza obsahu/gi, "")
    .replace(/AI-assisted content synthesis/gi, "")
    .replace(/MedScopeGlobal AI-Assisted Editorial Team/gi, "Redakce MedScopeGlobal")
    .replace(/\bkdy exactly\b/gi, "kdy")
    .replace(/\búspech/gi, "úspěch");
}

export function applyMagazineDeskCopy<
  T extends { slug?: string | null; title: string; excerpt?: string | null; content?: string | null },
>(article: T): T {
  const slug = String(article.slug ?? "");
  const override = MAGAZINE_DESK_OVERRIDES[slug];
  const title = anonymizeClinicianNames(override?.title ?? polishMagazineTitle(article.title));
  const excerpt = anonymizeClinicianNames(
    override?.excerpt ?? polishMagazineExcerpt(article.excerpt, title)
  );
  const rawContent = override?.content
    ? override.content
    : article.content
      ? stripEditorialChrome(article.content)
      : article.content;
  const content =
    rawContent == null ? rawContent : anonymizeClinicianNames(rawContent);
  return { ...article, slug: publicArticleSlug(slug), title, excerpt, content };
}

function collapseRepeatedChunks(text: string, sep: RegExp): string {
  const parts = text
    .split(sep)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return text;
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const part of parts) {
    const key = part.toLocaleLowerCase("cs-CZ").replace(/[.:!?·—–-]+/g, "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    kept.push(part);
  }
  if (kept.length === 0) return text;
  if (kept.length === 1) return kept[0]!;
  return kept.join(" — ");
}

function almostRepeatsTitle(excerpt: string, title: string): boolean {
  const a = normalizeKey(excerpt);
  const b = normalizeKey(title);
  if (!a || !b) return false;
  return a.startsWith(b) || b.startsWith(a) || (a.includes(b) && a.length < b.length + 24);
}

function normalizeKey(value: string): string {
  return value
    .toLocaleLowerCase("cs-CZ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
