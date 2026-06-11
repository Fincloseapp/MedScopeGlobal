import { createServiceRoleClient } from "@/lib/supabase/service";
import { extractWithAi } from "@/lib/v4c/ai-extract";
import {
  czechDrugSummary,
  classifyDrugStatus,
  extractDrugName,
  fetchAllDrugFeedItems,
  parsePubDate,
  stableDrugSlug,
} from "@/lib/v4c/drug-feed-fetch";
import { DRUG_AGENCY_META } from "@/lib/v4c/drug-sources";

export async function runDrugFeedIngest(options?: { maxItems?: number }): Promise<{
  fetched: number;
  inserted: number;
  skipped: number;
  errors: string[];
}> {
  const maxItems = options?.maxItems ?? 40;
  const admin = createServiceRoleClient();
  const items = (await fetchAllDrugFeedItems(6)).slice(0, maxItems);

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const item of items) {
    const sourceUrl = item.link;
    const slug = stableDrugSlug(item.agency, sourceUrl);

    const { data: byUrl } = await admin
      .from("drug_news")
      .select("id")
      .eq("source_url", sourceUrl)
      .maybeSingle();
    const { data: bySlug } = byUrl
      ? { data: byUrl }
      : await admin.from("drug_news").select("id").eq("slug", slug).maybeSingle();
    const existing = byUrl ?? bySlug;

    if (existing) {
      skipped++;
      continue;
    }

    const status = classifyDrugStatus(item.title, item.description);
    const drugName = extractDrugName(item.title);
    const agencyMeta = DRUG_AGENCY_META[item.agency];

    let summary = czechDrugSummary(item);
    let titleCs = item.title;

    try {
      const ai = await extractWithAi("leky", {
        title: item.title,
        raw: `${item.description}\n\nZdroj: ${agencyMeta.short} — ${item.portalUrl}`,
        sourceUrl,
        sourceName: agencyMeta.short,
      });
      if (typeof ai.title === "string" && ai.title.length > 5) titleCs = ai.title;
      if (typeof ai.summary === "string" && ai.summary.length > 20) summary = ai.summary;
    } catch {
      /* fallback summary */
    }

    const { error } = await admin.from("drug_news").insert({
      title: titleCs,
      slug,
      drug_name: drugName,
      status,
      agency: item.agency,
      source_url: sourceUrl,
      source_name: agencyMeta.short,
      summary,
      body: item.description || null,
      image_url: null,
      ai_metadata: { sourceId: item.sourceId, originalTitle: item.title },
      published: true,
      published_date: parsePubDate(item.pubDate) ?? new Date().toISOString().slice(0, 10),
    });

    if (error) {
      errors.push(`${slug}: ${error.message}`);
    } else {
      inserted++;
    }
  }

  return { fetched: items.length, inserted, skipped, errors };
}
