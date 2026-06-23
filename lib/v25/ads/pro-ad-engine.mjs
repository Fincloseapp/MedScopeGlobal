/**
 * v25.2 — ProAdEngine: reklamy pro lékaře a B2B
 */
import { appendLog } from "../shared.mjs";
import { getSupabaseAdmin } from "../writers/writer-base.mjs";
import {
  AD_MARKERS,
  applyAdsToArticles,
  pickProCampaigns,
  logClick,
} from "./ad-engine-base.mjs";

const TABLE = "pro_ad_campaigns";
const MARKER = AD_MARKERS.pro;
const LOG = "v25-pro-ads.log";

export { renderAdBlock, insertAdBlocks, pickProCampaigns } from "./ad-engine-base.mjs";

export async function loadActiveProCampaigns(supabaseClient) {
  const admin = supabaseClient ?? getSupabaseAdmin();
  const { loadActiveCampaigns } = await import("./ad-engine-base.mjs");
  return loadActiveCampaigns(admin, TABLE);
}

export async function logProClick(supabaseClient, campaignId) {
  const admin = supabaseClient ?? getSupabaseAdmin();
  return logClick(admin, TABLE, campaignId, LOG);
}

export async function applyAdsToProArticles(options = {}) {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, detail: "no supabase" };

  return applyAdsToArticles(admin, {
    table: TABLE,
    marker: MARKER,
    audience: "professional",
    selectFields: "id, slug, content, category_slug:categories(slug)",
    pickFn: (campaigns, row) => {
      const article = {
        ...row,
        category_slug: row.category_slug?.slug ?? null,
      };
      return pickProCampaigns(campaigns, article);
    },
    segment: "pro",
    limit: options.limit ?? 24,
    logFile: LOG,
  });
}

export async function runProAdEngine(options = {}) {
  const result = await applyAdsToProArticles(options);
  appendLog(LOG, `runProAdEngine ok=${result.ok} ${result.detail ?? ""}`);
  return result;
}
