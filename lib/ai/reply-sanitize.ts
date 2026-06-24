/** Removes LLM boilerplate that claims Supabase/context limitations (V5+ diagnostic fix). */

const BLOCKED_REPLY_PATTERNS = [
  /vzhledem k omezen[ií]/i,
  /omezen[ií].*kontextu\s+supabase/i,
  /kontextu\s+supabase.*nelze/i,
  /nemohu.*supabase/i,
  /supabase.*(nelze|nepodař)/i,
  /due to (the )?limitations.*supabase/i,
];

export function isBlockedSupabaseLimitationReply(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return BLOCKED_REPLY_PATTERNS.some((p) => p.test(t));
}

export function stripBlockedPhrases(text: string): string {
  let out = text;
  for (const p of BLOCKED_REPLY_PATTERNS) {
    out = out.replace(p, "");
  }
  return out.replace(/\n{3,}/g, "\n\n").trim();
}
