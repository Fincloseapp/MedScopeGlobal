import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { resolveLocalePath } from "@/lib/i18n/locale-path";

/** Public student-room URL. Never double-prefix /cs. */
export function studentPublicHref(href: string, locale = "cs"): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const { locale: existing } = resolveLocalePath(href.split("?")[0] || href);
  if (existing) return href;
  return localizePublicHref(href, locale);
}
