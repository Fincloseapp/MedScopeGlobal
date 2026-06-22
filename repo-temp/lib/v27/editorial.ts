/**
 * v27 editorial — extends v26 A–D standard, personas, foreign news.
 * Crons continue using v26 engines; v27 adds audience routing metadata.
 */
import { V26_SECTIONS, mergeV26Metadata, type V26ArticleMetadata } from "@/lib/v26/editorial-standard";
import { runV26RewriteBackfill } from "@/lib/v26/backfill";
import { runV26ForeignNewsIngest } from "@/lib/v26/foreign-news-ingest";
import type { V27Audience } from "@/lib/v27/config";

export { V26_SECTIONS, mergeV26Metadata };
export type { V26ArticleMetadata };

export const V27_EDITORIAL_AUDIENCES: V27Audience[] = ["public", "student", "physician"];

export const V27_AUDIENCE_SECTION_MAP: Record<V27Audience, string[]> = {
  public: ["prevence", "vyziva", "spanek", "fitness", "verejnost"],
  student: ["anatomie", "farmakologie", "studium", "prijimacky"],
  physician: ["guidelines", "studie", "klinika", "cme"],
  b2b: ["partnerstvi", "sponzor"],
};

export interface V27EditorialMetadata extends V26ArticleMetadata {
  v27_audience?: V27Audience;
  v27_pillar?: string;
}

export function mergeV27Metadata(
  existing: Record<string, unknown> | null | undefined,
  patch: V27EditorialMetadata
): Record<string, unknown> {
  return mergeV26Metadata(existing, {
    ...patch,
    editorial_version: patch.editorial_version ?? "27",
  });
}

/** Run v26 backfill with v27 audience tagging (delegates to v26 engine) */
export async function runV27EditorialBackfill(options?: { batchSize?: number; audience?: V27Audience }) {
  const result = await runV26RewriteBackfill({
    batchSize: options?.batchSize,
    audience: options?.audience === "b2b" ? "public" : options?.audience,
  });
  return { ...result, v27Audience: options?.audience ?? "public", editorialVersion: "27" };
}

/** Foreign news ingest — unchanged v26 pipeline */
export async function runV27ForeignNewsIngest() {
  return runV26ForeignNewsIngest();
}
