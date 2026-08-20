/** Drop generic filler so magazine hubs stay serious and on-topic. */

const THIN_PUBLIC_TITLE =
  /^(zdravý život|zdraví na dosah|zdraví pro každého|zdraví pro každý den)\b/i;

const GENERIC_ADVICE =
  /10 praktických rad pro každého|praktické rady pro kaž(?:dého|dý den)/i;

const THIN_NEWS_PREFIX =
  /^(klinická studie|zdravotní zpráva|epidemiologická zpráva|komentář):\s*(umělá inteligence|epidemie a cdc|who a hiv|cdc|hiv|who)\s*$/i;

const PLACEHOLDER_UNIVERSITY =
  /(?:\d\.\s*)?LF\s*(?:UK|MU|HK|OL|PL|OU)?\s*[—\-–:]?\s*(?:výzkumná novinka|výzkumné objevy|výzkumné úspěchy)?\s*$/i;

const GENERIC_DISCOVERY =
  /^nový objev v léčbě|^new breakthrough in|^nový výzkum (?:v oblasti|na)|^nový projekt (?:v oblasti|na rozvoji|pro zlepšení)|^nové (?:centrum|přístupy|přístroje|ústav) |^výzkum na lékařské fakultě|^výzkumné (?:úspěchy|objevy)/i;

export function isThinMagazineTitle(title?: string | null): boolean {
  const t = String(title ?? "").replace(/\s+/g, " ").trim();
  if (t.length < 16) return true;
  if (THIN_PUBLIC_TITLE.test(t)) return true;
  if (GENERIC_ADVICE.test(t) && t.length < 64) return true;
  if (THIN_NEWS_PREFIX.test(t)) return true;
  if (/^(umělá inteligence|epidemie a cdc|who a hiv)$/i.test(t)) return true;
  if (/^(klinická studie|zdravotní zpráva|epidemiologická zpráva):\s*.{0,22}$/i.test(t)) {
    return true;
  }
  if (/zahraniční zdravotnická zpráva/i.test(t) && t.length < 64) return true;
  return false;
}

export function isPlaceholderUniversityNewsTitle(title?: string | null): boolean {
  const t = String(title ?? "").replace(/\s+/g, " ").trim();
  if (t.length < 18) return true;
  if (PLACEHOLDER_UNIVERSITY.test(t)) return true;
  if (/výzkumná novinka/i.test(t)) return true;
  if (GENERIC_DISCOVERY.test(t) && t.length < 90) return true;
  return false;
}

export function filterMagazineArticles<T extends { title?: string | null }>(articles: T[]): T[] {
  return articles.filter((article) => !isThinMagazineTitle(article.title));
}
