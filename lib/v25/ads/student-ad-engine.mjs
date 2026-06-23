/**
 * v25.2 — StudentAdEngine: reklamy pro studentský obsah
 */
import { appendLog } from "../shared.mjs";
import { getSupabaseAdmin } from "../writers/writer-base.mjs";
import {
  AD_MARKERS,
  applyAdsToArticles,
  pickStudentCampaigns,
  logClick,
} from "./ad-engine-base.mjs";

const TABLE = "student_ad_campaigns";
const MARKER = AD_MARKERS.student;
const LOG = "v25-student-ads.log";

export { renderAdBlock, insertAdBlocks, pickStudentCampaigns } from "./ad-engine-base.mjs";

export async function loadActiveStudentCampaigns(supabaseClient) {
  const admin = supabaseClient ?? getSupabaseAdmin();
  const { loadActiveCampaigns } = await import("./ad-engine-base.mjs");
  return loadActiveCampaigns(admin, TABLE);
}

export async function logStudentClick(supabaseClient, campaignId) {
  const admin = supabaseClient ?? getSupabaseAdmin();
  return logClick(admin, TABLE, campaignId, LOG);
}

export async function applyAdsToStudentArticles(options = {}) {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, detail: "no supabase" };

  return applyAdsToArticles(admin, {
    table: TABLE,
    marker: MARKER,
    audience: "professional",
    selectFields: "id, slug, content, study_year, med_track, student_topic",
    pickFn: pickStudentCampaigns,
    topicField: "target_topics",
    segment: "student",
    limit: options.limit ?? 24,
    logFile: LOG,
  });
}

export async function runStudentAdEngine(options = {}) {
  const result = await applyAdsToStudentArticles(options);
  appendLog(LOG, `runStudentAdEngine ok=${result.ok} ${result.detail ?? ""}`);
  return result;
}
