/**
 * v25.2 — Sdílená logika pro všechny ad enginy (public, student, pro)
 */
import { appendLog } from "../shared.mjs";

export const AD_MARKERS = {
  public: "ms-public-ad",
  student: "ms-student-ad",
  pro: "ms-pro-ad",
};

export function renderAdBlock(campaign, segment = "public") {
  const marker = AD_MARKERS[segment] ?? AD_MARKERS.public;
  const cta = campaign.cta_text || "Více informací";
  const url = campaign.affiliate_url || "#";
  const typeClass = campaign.type ? ` ${marker}--${campaign.type}` : "";
  return `<aside class="${marker}${typeClass}" data-campaign-id="${campaign.id}" data-ad-type="${campaign.type ?? "inline"}" data-ad-segment="${segment}">
  <div class="${marker}__label">Doporučený obsah</div>
  <div class="${marker}__body">${campaign.body_html || campaign.title}</div>
  <a class="${marker}__cta" href="${url}" data-ad-click="${campaign.id}" rel="sponsored noopener" target="_blank">${cta}</a>
</aside>`;
}

export function pickCampaignsByTopics(campaigns, topic, topicField = "target_topics") {
  if (!campaigns?.length) return [];
  const matched = campaigns.filter((c) => {
    const topics = c[topicField] ?? [];
    return topics.length === 0 || (topic && topics.includes(topic));
  });
  return matched.length ? matched : campaigns;
}

export function insertAdBlocks(html, campaigns, options = {}) {
  const segment = options.segment ?? "public";
  const topic = options.topic ?? null;
  const topicField = options.topicField ?? "target_topics";
  const marker = AD_MARKERS[segment] ?? AD_MARKERS.public;
  const pool = pickCampaignsByTopics(campaigns, topic, topicField);
  if (!pool.length) return { html, inserted: 0, campaignIds: [] };

  if ((html ?? "").includes(marker)) {
    return { html, inserted: 0, campaignIds: [] };
  }

  const parts = html.split(/(<\/p>)/i);
  if (parts.length < 3) {
    const block = renderAdBlock(pool[0], segment);
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
    out.push("\n", renderAdBlock(campaign, segment), "\n");
    inserted += 1;
    campaignIds.push(campaign.id);
    poolIdx += 1;
  }

  return { html: out.join(""), inserted, campaignIds };
}

export async function loadActiveCampaigns(admin, table) {
  if (!admin) return [];
  const { data, error } = await admin
    .from(table)
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false });
  if (error) {
    appendLog("v25-ads.log", `loadActiveCampaigns(${table}) error: ${error.message}`);
    return [];
  }
  return data ?? [];
}

export async function logImpressions(admin, table, campaignIds, logFile = "v25-ads.log") {
  if (!admin || !campaignIds?.length) return { ok: false };
  const unique = [...new Set(campaignIds)];
  for (const id of unique) {
    const { data } = await admin.from(table).select("impressions").eq("id", id).maybeSingle();
    const next = (data?.impressions ?? 0) + 1;
    await admin.from(table).update({ impressions: next, updated_at: new Date().toISOString() }).eq("id", id);
  }
  appendLog(logFile, `impressions +1 for ${unique.length} campaigns (${table})`);
  return { ok: true, count: unique.length };
}

export async function logClick(admin, table, campaignId, logFile = "v25-ads.log") {
  if (!admin || !campaignId) return { ok: false };
  const { data } = await admin.from(table).select("clicks").eq("id", campaignId).maybeSingle();
  const next = (data?.clicks ?? 0) + 1;
  const { error } = await admin
    .from(table)
    .update({ clicks: next, updated_at: new Date().toISOString() })
    .eq("id", campaignId);
  if (error) appendLog(logFile, `logClick error: ${error.message}`);
  return { ok: !error };
}

export function pickStudentCampaigns(campaigns, article) {
  if (!campaigns?.length) return [];
  const year = article.study_year ?? null;
  const track = article.med_track ?? null;
  const topic = article.student_topic ?? null;

  const matched = campaigns.filter((c) => {
    const years = c.study_years ?? [];
    const tracks = c.med_tracks ?? [];
    const topics = c.target_topics ?? [];
    const yearOk = years.length === 0 || (year && years.includes(year));
    const trackOk = tracks.length === 0 || (track && tracks.includes(track));
    const topicOk = topics.length === 0 || (topic && topics.includes(topic));
    return yearOk && trackOk && topicOk;
  });
  return matched.length ? matched : campaigns;
}

export function pickProCampaigns(campaigns, article) {
  if (!campaigns?.length) return [];
  const categorySlug =
    typeof article.category_slug === "string"
      ? article.category_slug
      : article.category_slug?.slug ?? null;
  const specialty = categorySlug ?? article.specialty ?? null;
  const matched = campaigns.filter((c) => {
    const specs = c.target_specialties ?? [];
    return specs.length === 0 || (specialty && specs.includes(specialty));
  });
  return matched.length ? matched : campaigns;
}

export async function applyAdsToArticles(admin, options) {
  const {
    table,
    marker,
    audience,
    selectFields,
    pickFn,
    topicField = "target_topics",
    segment,
    limit = 24,
    logFile,
  } = options;

  const { data: rows, error } = await admin
    .from("articles")
    .select(selectFields)
    .eq("audience", audience)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return { ok: false, detail: error.message };

  const campaigns = await loadActiveCampaigns(admin, table);
  if (!campaigns.length) return { ok: true, detail: "no active campaigns", updated: 0 };

  let updated = 0;
  const allCampaignIds = [];

  for (const row of rows ?? []) {
    if ((row.content ?? "").includes(marker)) continue;
    const pool = pickFn ? pickFn(campaigns, row) : campaigns;
    if (!pool.length) continue;

    const topic = row[topicField.replace("target_", "").replace("_topics", "_topic")] ?? row.public_topic ?? row.student_topic ?? null;
    const injected = insertAdBlocks(row.content ?? "", pool, { segment, topic, topicField });
    if (!injected.inserted) continue;

    const { error: upErr } = await admin.from("articles").update({ content: injected.html }).eq("id", row.id);
    if (!upErr) {
      updated += 1;
      allCampaignIds.push(...injected.campaignIds);
    }
  }

  await logImpressions(admin, table, allCampaignIds, logFile);
  return { ok: true, updated, campaigns: campaigns.length, detail: `${updated} articles patched` };
}
