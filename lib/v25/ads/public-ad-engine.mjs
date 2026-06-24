/**
 * v25 — PublicAdEngine: vkládání reklamních bloků do veřejného HTML obsahu
 */
import { appendLog } from "../shared.mjs";
import { getSupabaseAdmin } from "../writers/writer-base.mjs";

const AD_MARKER = "ms-public-ad";

export function renderAdBlock(campaign) {
  const cta = campaign.cta_text || "Více informací";
  const url = campaign.affiliate_url || "#";
  const typeClass = campaign.type ? ` ms-public-ad--${campaign.type}` : "";
  return `<aside class="${AD_MARKER}${typeClass}" data-campaign-id="${campaign.id}" data-ad-type="${campaign.type ?? "inline"}">
  <div class="ms-public-ad__label">Doporučený obsah</div>
  <div class="ms-public-ad__body">${campaign.body_html || campaign.title}</div>
  <a class="ms-public-ad__cta" href="${url}" data-ad-click="${campaign.id}" rel="sponsored noopener" target="_blank">${cta}</a>
</aside>`;
}

export function pickCampaigns(campaigns, topic) {
  if (!campaigns?.length) return [];
  const matched = campaigns.filter((c) => {
    const topics = c.target_topics ?? [];
    return topics.length === 0 || topics.includes(topic);
  });
  return matched.length ? matched : campaigns;
}

export function insertAdBlocks(html, campaigns, options = {}) {
  const topic = options.topic ?? null;
  const pool = pickCampaigns(campaigns, topic);
  if (!pool.length) return { html, inserted: 0, campaignIds: [] };

  const parts = html.split(/(<\/p>)/i);
  if (parts.length < 3) {
    const block = renderAdBlock(pool[0]);
    return { html: `${html}\n${block}`, inserted: 1, campaignIds: [pool[0].id] };
  }

  let inserted = 0;
  const campaignIds = [];
  let poolIdx = 0;
  let paragraphCount = 0;
  const out = [];

  for (let i = 0; i < parts.length; i++) {
    out.push(parts[i]);
    if (!/^<\/p>$/i.test(parts[i])) continue;
    paragraphCount += 1;
    const campaign = pool[poolIdx % pool.length];
    const freq = Math.max(1, campaign.frequency ?? 1);
    if (paragraphCount % freq !== 0) continue;
    out.push("\n", renderAdBlock(campaign), "\n");
    inserted += 1;
    campaignIds.push(campaign.id);
    poolIdx += 1;
  }

  return { html: out.join(""), inserted, campaignIds };
}

export async function loadActiveCampaigns(supabaseClient) {
  const admin = supabaseClient ?? getSupabaseAdmin();
  if (!admin) {
    appendLog("v25-public-ads.log", "loadActiveCampaigns: no supabase client");
    return [];
  }
  const { data, error } = await admin
    .from("public_ad_campaigns")
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false });
  if (error) {
    appendLog("v25-public-ads.log", `loadActiveCampaigns error: ${error.message}`);
    return [];
  }
  return data ?? [];
}

export async function logImpressions(supabaseClient, campaignIds) {
  const admin = supabaseClient ?? getSupabaseAdmin();
  if (!admin || !campaignIds?.length) return { ok: false };
  const unique = [...new Set(campaignIds)];
  for (const id of unique) {
    const { data } = await admin.from("public_ad_campaigns").select("impressions").eq("id", id).maybeSingle();
    const next = (data?.impressions ?? 0) + 1;
    await admin.from("public_ad_campaigns").update({ impressions: next, updated_at: new Date().toISOString() }).eq("id", id);
  }
  appendLog("v25-public-ads.log", `impressions +1 for ${unique.length} campaigns`);
  return { ok: true, count: unique.length };
}

export async function logClick(supabaseClient, campaignId) {
  const admin = supabaseClient ?? getSupabaseAdmin();
  if (!admin || !campaignId) return { ok: false };
  const { data } = await admin.from("public_ad_campaigns").select("clicks").eq("id", campaignId).maybeSingle();
  const next = (data?.clicks ?? 0) + 1;
  const { error } = await admin
    .from("public_ad_campaigns")
    .update({ clicks: next, updated_at: new Date().toISOString() })
    .eq("id", campaignId);
  if (error) appendLog("v25-public-ads.log", `logClick error: ${error.message}`);
  else appendLog("v25-public-ads.log", `click ${campaignId}`);
  return { ok: !error };
}

export async function applyAdsToPublicArticles(options = {}) {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, detail: "no supabase" };

  const limit = options.limit ?? 24;
  const { data: rows, error } = await admin
    .from("articles")
    .select("id, slug, content, public_topic")
    .eq("audience", "public")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return { ok: false, detail: error.message };

  const campaigns = await loadActiveCampaigns(admin);
  if (!campaigns.length) return { ok: true, detail: "no active campaigns", updated: 0 };

  let updated = 0;
  const allCampaignIds = [];

  for (const row of rows ?? []) {
    if ((row.content ?? "").includes(AD_MARKER)) continue;
    const injected = insertAdBlocks(row.content ?? "", campaigns, { topic: row.public_topic });
    if (!injected.inserted) continue;
    const { error: upErr } = await admin.from("articles").update({ content: injected.html }).eq("id", row.id);
    if (!upErr) {
      updated += 1;
      allCampaignIds.push(...injected.campaignIds);
    }
  }

  await logImpressions(admin, allCampaignIds);
  return { ok: true, updated, campaigns: campaigns.length, detail: `${updated} articles patched` };
}

export async function runPublicAdEngine(options = {}) {
  const result = await applyAdsToPublicArticles(options);
  appendLog("v25-public-ads.log", `runPublicAdEngine ok=${result.ok} ${result.detail ?? ""}`);
  return result;
}
