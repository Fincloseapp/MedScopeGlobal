import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  type ConversionCopy,
  type ConversionSlot,
  daySeed,
  getStaticCopy,
} from "@/lib/v38/conversion-copy";

export type StoredNudge = ConversionCopy & {
  id?: string;
  generatedBy: "static" | "ai";
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Resolve active copy for a slot — DB override → static rotation */
export async function resolveConversionCopy(
  slot: ConversionSlot,
  locale = "cs"
): Promise<StoredNudge> {
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin
      .from("conversion_nudges")
      .select("id, eyebrow, headline, body, cta_label, cta_href, hint, generated_by, created_at")
      .eq("slot", slot)
      .eq("locale", locale)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const created = new Date(data.created_at as string).getTime();
      if (Date.now() - created < CACHE_TTL_MS) {
        return {
          slot,
          eyebrow: String(data.eyebrow),
          headline: String(data.headline),
          body: String(data.body),
          ctaLabel: String(data.cta_label),
          ctaHref: String(data.cta_href ?? "/predplatne"),
          hint: data.hint ? String(data.hint) : undefined,
          id: String(data.id),
          generatedBy: (data.generated_by as "static" | "ai") ?? "ai",
        };
      }
    }
  } catch {
    /* table may not exist yet — fall through */
  }

  const staticCopy = getStaticCopy(slot, daySeed());
  return { ...staticCopy, generatedBy: "static" };
}

/** AI cron — refresh conversion copy for all slots */
export async function runConversionRenewals(): Promise<{
  ok: boolean;
  refreshed: number;
  llm: boolean;
  errors: string[];
}> {
  const slots: ConversionSlot[] = [
    "nav_strip",
    "nav_cta",
    "article_gate",
    "article_inline",
    "video_overlay",
  ];
  const errors: string[] = [];
  let refreshed = 0;
  const llm = isLlmConfigured();

  if (!llm) {
    return { ok: true, refreshed: 0, llm: false, errors: ["LLM not configured — static copy only"] };
  }

  let admin;
  try {
    admin = createServiceRoleClient();
    await admin.from("conversion_nudges").select("id").limit(1);
  } catch (e) {
    return { ok: false, refreshed: 0, llm: true, errors: [`DB: ${String(e)}`] };
  }

  for (const slot of slots) {
    const baseline = getStaticCopy(slot, daySeed());
    try {
      const raw = await generateJsonFromLlm({
        system: `Jsi copywriter MedScopeGlobal (český medicínský magazín). Vrať JSON: {"eyebrow","headline","body","ctaLabel","ctaHref","hint"}. Použij rámec "pro váš zájem" nebo "doporučeno pro vás". Buď stručný, důvěryhodný, bez agresivního prodeje. ctaHref vždy "/predplatne".`,
        user: `Obnov copy pro slot "${slot}". Referenční tón:\neyebrow: ${baseline.eyebrow}\nheadline: ${baseline.headline}\nbody: ${baseline.body}`,
        maxTokens: 400,
        temperature: 0.7,
      });

      if (!raw) {
        errors.push(`${slot}: LLM empty`);
        continue;
      }

      const parsed = JSON.parse(raw) as Record<string, string>;
      await admin.from("conversion_nudges").update({ active: false }).eq("slot", slot).eq("locale", "cs");
      await admin.from("conversion_nudges").insert({
        slot,
        locale: "cs",
        eyebrow: parsed.eyebrow ?? baseline.eyebrow,
        headline: parsed.headline ?? baseline.headline,
        body: parsed.body ?? baseline.body,
        cta_label: parsed.ctaLabel ?? baseline.ctaLabel,
        cta_href: parsed.ctaHref ?? "/predplatne",
        hint: parsed.hint ?? baseline.hint ?? null,
        generated_by: "ai",
        active: true,
      });
      refreshed += 1;
    } catch (e) {
      errors.push(`${slot}: ${String(e)}`);
    }
  }

  return { ok: errors.length === 0, refreshed, llm: true, errors };
}
