import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { loadAiAgentGrowthSnapshot } from "@/lib/growth/ai-agent-stats";
import { runRevenueOps, type RevenueOpsResult } from "@/lib/monetization/revenue-ops";
import { runRevenueReconcile, type ReconcileResult } from "@/lib/monetization/revenue-reconcile";
import { conversionHopUrls } from "@/lib/growth/ai-agent-hops";
import {
  articleDiscoveryUrls,
  priorityDiscoveryUrls,
  submitIndexNow,
  type IndexNowResult,
} from "@/lib/seo/indexnow";
import { legalChannels } from "@/lib/growth/ai-agent-program";

export type LegalSprintResult = {
  ok: boolean;
  offTrack: boolean;
  liveSubscribers: number;
  nearNeededPerDay: number;
  sep27NeededPerDay: number;
  honesty:
    "Cíle 170 000 / 500 000 jsou programové. Cron nevymýšlí předplatitele — spouští jen legální kanály (IndexNow, sitemap, reconcilace Stripe, výplata, newsletter).";
  revenueOps: RevenueOpsResult | null;
  reconcile: ReconcileResult | null;
  indexNow: IndexNowResult | null;
  extraArticles: number;
  channels: { id: string; label: string }[];
  actions: string[];
  errors: string[];
  timestamp: string;
};

async function recentPublishedSlugs(limit = 12): Promise<string[]> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return [];
  try {
    const { data } = await admin
      .from("articles")
      .select("slug")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    return (data ?? [])
      .map((row) => String(row.slug ?? "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function runLegalGrowthSprint(opts?: {
  includeRevenueOps?: boolean;
  indexNow?: boolean;
}): Promise<LegalSprintResult> {
  const includeRevenueOps = opts?.includeRevenueOps !== false;
  const runIndexNow = opts?.indexNow !== false;
  const actions: string[] = [];
  const errors: string[] = [];
  const snap = await loadAiAgentGrowthSnapshot();
  const offTrack = !snap.goals.near.onTrack || !snap.goals.sep27.onTrack;

  let revenueOps: RevenueOpsResult | null = null;
  if (includeRevenueOps) {
    try {
      revenueOps = await runRevenueOps();
      actions.push(`newsletter promote ${revenueOps.promoted}`);
      errors.push(...revenueOps.errors);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "revenue ops failed");
    }
  }

  let reconcile: ReconcileResult | null = null;
  try {
    reconcile = await runRevenueReconcile();
    if (reconcile.markedPaid) actions.push(`objednávky paid ${reconcile.markedPaid}`);
    if (reconcile.markedExpired) actions.push(`objednávky expired ${reconcile.markedExpired}`);
    if (reconcile.payoutsCreated) actions.push(`výplaty ${reconcile.payoutsCreated}`);
    actions.push(...reconcile.notes);
    errors.push(...reconcile.errors);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "reconcile failed");
  }

  let extraArticles = 0;
  let indexNow: IndexNowResult | null = null;
  if (runIndexNow) {
    const urls = priorityDiscoveryUrls();
    const agentHops = conversionHopUrls();
    urls.push(...agentHops);
    actions.push(`IndexNow hop ${agentHops.length} URL pro všech 16 agentů na /predplatne`);
    if (offTrack) {
      const slugs = await recentPublishedSlugs(12);
      extraArticles = slugs.length;
      urls.push(...articleDiscoveryUrls(slugs));
      actions.push(`IndexNow + ${slugs.length} článků (tempo mimo cíl)`);
    } else {
      actions.push("IndexNow priorita URL");
    }
    try {
      indexNow = await submitIndexNow(urls);
      actions.push(`IndexNow ${indexNow.submitted} URL · HTTP ${indexNow.status}`);
      if (indexNow.error) errors.push(indexNow.error);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "indexnow failed");
    }
  }

  return {
    ok: errors.length === 0,
    offTrack,
    liveSubscribers: snap.subscribers.totalLive,
    nearNeededPerDay: snap.goals.near.dailyNeeded,
    sep27NeededPerDay: snap.goals.sep27.dailyNeeded,
    honesty:
      "Cíle 170 000 / 500 000 jsou programové. Cron nevymýšlí předplatitele — spouští jen legální kanály (IndexNow, sitemap, reconcilace Stripe, výplata, newsletter).",
    revenueOps,
    reconcile,
    indexNow,
    extraArticles,
    channels: legalChannels(),
    actions: actions.filter(Boolean),
    errors,
    timestamp: new Date().toISOString(),
  };
}
