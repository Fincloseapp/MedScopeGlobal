/**
 * v25.3 — ManualAdInserter: vkládání ručních reklamních placementů podle cesty a audience
 */
import { appendLog } from "../shared.mjs";
import { getSupabaseAdmin } from "../writers/writer-base.mjs";

const MARKER = "ms-manual-ad";
const LOG = "v25-manual-ads.log";

const AUDIENCE_MAP = {
  public: "public",
  student: "professional",
  pro: "professional",
};

export function matchTargetPath(pattern, slug) {
  if (!pattern || pattern === "/*" || pattern === "*") return true;
  const paths = [`/${slug}`, `/articles/${slug}`, slug];
  if (pattern.endsWith("*")) {
    const prefix = pattern.slice(0, -1);
    return paths.some((p) => p.startsWith(prefix) || p.includes(prefix.replace(/^\//, "")));
  }
  return paths.some((p) => p === pattern || p.endsWith(pattern) || pattern.endsWith(p));
}

export function renderManualBlock(placement) {
  const zone = placement.placement_zone ?? "inline";
  const id = placement.id;
  const campaignAttr = placement.campaign_id ? ` data-campaign-id="${placement.campaign_id}"` : "";
  return `<aside class="${MARKER} ${MARKER}--${zone}" data-placement-id="${id}" data-ad-zone="${zone}"${campaignAttr}>
${placement.html}
</aside>`;
}

export function insertManualIntoHtml(html, placements) {
  if (!placements?.length) return { html, inserted: 0, placementIds: [] };

  const sorted = [...placements].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const placementIds = [];
  let result = html ?? "";

  for (const placement of sorted) {
    const block = renderManualBlock(placement);
    const zone = placement.placement_zone;

    if (zone === "header") {
      if (!result.includes(`data-placement-id="${placement.id}"`)) {
        result = `${block}\n${result}`;
        placementIds.push(placement.id);
      }
      continue;
    }

    if (zone === "footer" || zone === "article" || zone === "sidebar" || zone === "custom_path") {
      if (!result.includes(`data-placement-id="${placement.id}"`)) {
        result = `${result}\n${block}`;
        placementIds.push(placement.id);
      }
      continue;
    }

    // inline — insert after first </p>
    if (result.includes(`data-placement-id="${placement.id}"`)) continue;
    const parts = result.split(/(<\/p>)/i);
    if (parts.length >= 3) {
      parts.splice(2, 0, "\n", block, "\n");
      result = parts.join("");
    } else {
      result = `${result}\n${block}`;
    }
    placementIds.push(placement.id);
  }

  return { html: result, inserted: placementIds.length, placementIds };
}

export async function loadActiveManualPlacements(admin, audience) {
  if (!admin) return [];
  let q = admin
    .from("manual_ad_placements")
    .select("*")
    .eq("active", true)
    .order("priority", { ascending: false });
  if (audience) q = q.eq("audience", audience);
  const { data, error } = await q;
  if (error) {
    appendLog(LOG, `loadActiveManualPlacements error: ${error.message}`);
    return [];
  }
  return data ?? [];
}

export async function applyManualPlacementsToArticles(options = {}) {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, detail: "no supabase" };

  const limit = options.limit ?? 24;
  const audiences = options.audiences ?? ["public", "student", "pro"];
  let updated = 0;
  const allPlacementIds = [];

  for (const aud of audiences) {
    const dbAudience = AUDIENCE_MAP[aud] ?? "public";
    const placements = await loadActiveManualPlacements(admin, aud);
    if (!placements.length) continue;

    const { data: rows, error } = await admin
      .from("articles")
      .select("id, slug, content")
      .eq("audience", dbAudience)
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      appendLog(LOG, `articles query (${aud}) error: ${error.message}`);
      continue;
    }

    for (const row of rows ?? []) {
      const matched = placements.filter((p) => matchTargetPath(p.target_path, row.slug));
      if (!matched.length) continue;
      if ((row.content ?? "").includes(MARKER) && matched.every((p) => (row.content ?? "").includes(`data-placement-id="${p.id}"`))) {
        continue;
      }

      const injected = insertManualIntoHtml(row.content ?? "", matched);
      if (!injected.inserted) continue;

      const { error: upErr } = await admin.from("articles").update({ content: injected.html }).eq("id", row.id);
      if (!upErr) {
        updated += 1;
        allPlacementIds.push(...injected.placementIds);
      }
    }
  }

  appendLog(LOG, `applyManualPlacements: ${updated} articles, ${allPlacementIds.length} placements`);
  return { ok: true, updated, placements: allPlacementIds.length, detail: `${updated} articles patched` };
}

export async function runManualAdInserter(options = {}) {
  appendLog(LOG, "runManualAdInserter start");
  const result = await applyManualPlacementsToArticles(options);
  appendLog(LOG, `runManualAdInserter ok=${result.ok} ${result.detail ?? ""}`);
  return result;
}
