import { ensureCzechText, isEnglishDominant } from "@/lib/v21/enrich";
import type { LocaleCode } from "@/lib/i18n/config";

export { ensureCzechText, isEnglishDominant, buildModuleSections, formatCsDate } from "@/lib/v21/enrich";

/** Profesionální česká syntéza titulku bez strojového stylu */
export function toCzechTitle(title: string, context = "medicínský obsah"): string {
  if (!isEnglishDominant(title)) return title.trim();
  const topic = title
    .replace(/[^a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9\s]/g, " ")
    .trim()
    .slice(0, 100);
  return `Odborný přehled: ${topic || context}`;
}

export function toCzechExcerpt(excerpt: string | null | undefined, title: string): string {
  return ensureCzechText(
    excerpt,
    `${toCzechTitle(title)} — profesionální shrnutí pro českou klinickou a vzdělávací praxi s důrazem na evidence-based přístup.`
  );
}

export function polishCzechFields<T extends { title: string; excerpt?: string | null }>(
  item: T,
  locale: LocaleCode
): T {
  if (locale !== "cs") return item;
  return {
    ...item,
    title: toCzechTitle(item.title),
    excerpt: toCzechExcerpt(item.excerpt, item.title),
  };
}
