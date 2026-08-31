/** Detect leftover Czech so non-CS editions never ship Czech copy. */
/** Letters that are Czech-specific (not shared with French/Spanish é, á, í, ó, ú). */
const CS_UNIQUE = /[čďěňřšťůýž]/i;
const CS_WORDS =
  /\b(že|které|který|která|když|nebo|také|proč|článek|článku|lékař|lékaře|zdraví|pohoda|vyhledat|odbornou|příspěvek|darovat|redakce|poslechnout|duševní|onemocnění)\b/i;

export function looksLikeCzech(text: string | null | undefined): boolean {
  if (!text) return false;
  const plain = text.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length < 12) return CS_UNIQUE.test(plain);
  return CS_UNIQUE.test(plain) || CS_WORDS.test(plain);
}

/** English leftovers that must not appear on the Czech edition. */
const EN_STOP =
  /\b(the|and|with|from|this|that|study|patients|treatment|clinical|health|article|listen|donate|support the author|editorial)\b/i;

export function looksLikeEnglish(text: string | null | undefined): boolean {
  if (!text) return false;
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (CS_UNIQUE.test(plain)) return false;
  return EN_STOP.test(plain);
}
