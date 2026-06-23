import { getHomepageCurated, type HomepageCuratedRow } from "@/lib/queries/v4c/homepage";
import { getCached, setCached, cacheKey } from "@/lib/v20/server-cache";
import { toCzechExcerpt, toCzechTitle } from "@/lib/v22/translate";
import { v21ImageForModule } from "@/lib/v21/images";

const TTL = 120_000;

const SLOT_CONTEXT: Record<string, string> = {
  study: "klinická studie",
  drug_news: "léková novinka",
  legislation: "legislativa",
  digital_health: "digitální zdravotnictví",
  university_news: "univerzitní novinka",
};

function enrichCuratedRow(row: HomepageCuratedRow): HomepageCuratedRow {
  const ctx = SLOT_CONTEXT[row.entity_type] ?? "medicínský obsah";
  return {
    ...row,
    title: toCzechTitle(row.title, ctx),
    excerpt: toCzechExcerpt(row.excerpt, row.title),
    image_url:
      row.image_url ??
      v21ImageForModule(
        row.entity_type === "study"
          ? "study"
          : row.entity_type === "drug_news"
            ? "drug"
            : row.entity_type === "legislation"
              ? "legislation"
              : row.entity_type === "digital_health"
                ? "digitalHealth"
                : "university",
        row.id
      ),
  };
}

export async function getV22HomepageCurated(slot?: string): Promise<HomepageCuratedRow[]> {
  const ck = cacheKey({ route: "v22-hp-curated", slot: slot ?? "all" });
  const cached = getCached<HomepageCuratedRow[]>(ck, TTL);
  if (cached) return cached;

  const rows = await getHomepageCurated(slot);
  const enriched = rows.map(enrichCuratedRow);
  setCached(ck, enriched);
  return enriched;
}
