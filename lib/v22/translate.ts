import { ensureCzechText, isEnglishDominant } from "@/lib/v21/enrich";
import { polishCzechHtml, polishCzechText } from "@/lib/i18n/czech-polish";
import type { LocaleCode } from "@/lib/i18n/config";

export { ensureCzechText, isEnglishDominant, buildModuleSections, formatCsDate } from "@/lib/v21/enrich";
export { polishCzechText, polishCzechHtml } from "@/lib/i18n/czech-polish";

/** Profesionální česká syntéza titulku bez strojového stylu */
export function toCzechTitle(title: string, context = "medicínský obsah"): string {
  if (!isEnglishDominant(title)) return title.trim();
  const topic = title
    .replace(/[^a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9\s]/g, " ")
    .trim()
    .slice(0, 100);
  if (context.includes("studie")) {
    return `Klinická studie: ${topic || "revmatologie"}`;
  }
  return `Odborný přehled — ${context}: ${topic || context}`;
}

export function toCzechExcerpt(excerpt: string | null | undefined, title: string): string {
  return ensureCzechText(
    excerpt,
    `${toCzechTitle(title)} — profesionální shrnutí pro českou klinickou a vzdělávací praxi s důrazem na evidence-based přístup.`
  );
}

export function polishCzechFields<
  T extends { title: string; excerpt?: string | null; content?: string | null },
>(item: T, locale: LocaleCode): T {
  if (locale !== "cs") return item;
  const title = isEnglishDominant(item.title)
    ? toCzechTitle(item.title)
    : polishCzechText(item.title);
  const excerpt = isEnglishDominant(item.excerpt ?? "")
    ? toCzechExcerpt(item.excerpt, item.title)
    : item.excerpt
      ? polishCzechText(item.excerpt)
      : item.excerpt;
  const content = item.content ? polishCzechHtml(item.content) : item.content;
  return { ...item, title, excerpt, content };
}
