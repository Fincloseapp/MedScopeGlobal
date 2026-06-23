import { createServiceRoleClient } from "@/lib/supabase/service";
import { extractWithAi } from "@/lib/v4c/ai-extract";
import {
  czechDrugSummary,
  classifyDrugStatus,
  extractDrugName,
  fetchAllDrugFeedItems,
  fetchSuklArticleBody,
  parsePubDate,
  stableDrugSlug,
  type DrugFeedItem,
} from "@/lib/v4c/drug-feed-fetch";
import { stripDrugHtml } from "@/lib/v4c/drug-content";
import { DRUG_AGENCY_META } from "@/lib/v4c/drug-sources";

async function resolveArticleBody(item: DrugFeedItem): Promise<string | null> {
  if (item.bodyHtml?.trim()) return item.bodyHtml;
  if (item.agency === "sukl") {
    const fromApi = await fetchSuklArticleBody(item.link);
    if (fromApi) return fromApi;
  }
  const plain = item.description?.trim();
  return plain && plain.length > 80 ? plain : null;
}

async function buildDrugRow(item: DrugFeedItem) {
  const status = classifyDrugStatus(item.title, item.description);
  const drugName = extractDrugName(item.title);
  const agencyMeta = DRUG_AGENCY_META[item.agency];
  const bodyRaw = await resolveArticleBody(item);

  let summary = czechDrugSummary(item);
  let titleCs = item.title;

  const aiInput = bodyRaw ? stripDrugHtml(bodyRaw).slice(0, 6000) : item.description;

  try {
    const ai = await extractWithAi("leky", {
      title: item.title,
      raw: `${aiInput}\n\nZdroj: ${agencyMeta.short}`,
      sourceUrl: item.link,
      sourceName: agencyMeta.short,
    });
    if (typeof ai.title === "string" && ai.title.length > 5) titleCs = ai.title;
    if (typeof ai.summary === "string" && ai.summary.length > 40) summary = ai.summary;
  } catch {
    /* fallback */
  }

  if (bodyRaw && stripDrugHtml(bodyRaw).length > summary.length) {
    const first = stripDrugHtml(bodyRaw).split(/\n\n+/)[0]?.trim();
    if (first && first.length > 60 && !summary.includes(first.slice(0, 40))) {
      summary = first.slice(0, 500);
    }
  }

  return {
    title: titleCs,
    slug: stableDrugSlug(item.agency, item.link),
    drug_name: drugName,
    status,
    agency: item.agency,
    source_url: item.link,
    source_name: agencyMeta.short,
    summary,
    body: bodyRaw ?? item.description ?? null,
    image_url: null,
    ai_metadata: { sourceId: item.sourceId, originalTitle: item.title },
    published: true,
    published_date: parsePubDate(item.pubDate) ?? new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  };
}

export async function runDrugFeedIngest(options?: {
  maxItems?: number;
  refreshExisting?: boolean;
}): Promise<{
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const maxItems = options?.maxItems ?? 40;
  const refreshExisting = options?.refreshExisting !== false;
  const admin = createServiceRoleClient();
  const items = (await fetchAllDrugFeedItems(6)).slice(0, maxItems);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const item of items) {
    const sourceUrl = item.link;
    const slug = stableDrugSlug(item.agency, sourceUrl);

    const { data: existing } = await admin
      .from("drug_news")
      .select("id, body, summary")
      .eq("source_url", sourceUrl)
      .maybeSingle();

    if (existing) {
      if (refreshExisting) {
        const row = await buildDrugRow(item);
        const bodyLen = stripDrugHtml(existing.body ?? "").length;
        const newBodyLen = stripDrugHtml(row.body ?? "").length;
        if (newBodyLen > bodyLen + 40 || (existing.summary?.length ?? 0) < 60) {
          const { error } = await admin
            .from("drug_news")
            .update({
              title: row.title,
              summary: row.summary,
              body: row.body,
              status: row.status,
              drug_name: row.drug_name,
              updated_at: row.updated_at,
            })
            .eq("id", existing.id);
          if (error) errors.push(`${slug}: ${error.message}`);
          else updated++;
        } else skipped++;
      } else skipped++;
      continue;
    }

    const row = await buildDrugRow(item);
    const { error } = await admin.from("drug_news").insert(row);

    if (error) {
      errors.push(`${slug}: ${error.message}`);
    } else {
      inserted++;
    }
  }

  return { fetched: items.length, inserted, updated, skipped, errors };
}

/** Doplní plné znění u již importovaných SÚKL článků. */
export async function runDrugBodyBackfill(): Promise<{ updated: number; errors: string[] }> {
  const admin = createServiceRoleClient();
  const { data: rows } = await admin
    .from("drug_news")
    .select("id, source_url, agency, body")
    .eq("agency", "sukl")
    .limit(80);

  let updated = 0;
  const errors: string[] = [];

  for (const row of rows ?? []) {
    const currentLen = stripDrugHtml(row.body ?? "").length;
    if (currentLen > 400) continue;
    const body = await fetchSuklArticleBody(row.source_url ?? "");
    if (!body || stripDrugHtml(body).length <= currentLen) continue;
    const { error } = await admin
      .from("drug_news")
      .update({ body, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) errors.push(row.id);
    else updated++;
  }

  return { updated, errors };
}
