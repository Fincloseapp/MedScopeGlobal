import { createServiceRoleClient } from "@/lib/supabase/service";
import type { QualityReview } from "@/lib/v37/quality-engine/reviewArticle";

export type EntityType = "article" | "video" | "course" | "lesson";

export async function persistQualityReview(input: {
  entity_type: EntityType;
  entity_id: string;
  review: QualityReview;
  status?: "pending" | "reviewed" | "auto_fixed" | "dismissed";
}): Promise<string | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("content_quality_reviews")
    .upsert(
      {
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        score: input.review.score,
        issues: input.review.issues,
        suggestions: input.review.suggestions,
        status: input.status ?? "reviewed",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "entity_type,entity_id" }
    )
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[v37] persistQualityReview", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function listQualityReviews(limit = 50) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("content_quality_reviews")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

export async function applyAutoFixSuggestions(input: {
  entity_type: EntityType;
  entity_id: string;
  review: QualityReview;
}): Promise<{ applied: boolean; fields: string[] }> {
  const fields: string[] = [];
  const admin = createServiceRoleClient();

  if (input.entity_type === "lesson" && input.review.suggestions.length) {
    const { data: lesson } = await admin.from("lessons").select("content_json").eq("id", input.entity_id).maybeSingle();
    if (lesson) {
      const cj = (lesson.content_json ?? {}) as Record<string, unknown>;
      if (!cj.quality_notes) {
        cj.quality_notes = input.review.suggestions;
        await admin.from("lessons").update({ content_json: cj }).eq("id", input.entity_id);
        fields.push("content_json.quality_notes");
      }
    }
  }

  if (input.entity_type === "video" && input.review.suggestions.some((s) => s.includes("popis"))) {
    const { data: asset } = await admin.from("video_assets").select("metadata").eq("id", input.entity_id).maybeSingle();
    if (asset) {
      const meta = (asset.metadata ?? {}) as Record<string, unknown>;
      if (!meta.description && input.review.suggestions[0]) {
        meta.description = input.review.suggestions[0];
        await admin.from("video_assets").update({ metadata: meta }).eq("id", input.entity_id);
        fields.push("metadata.description");
      }
    }
  }

  if (fields.length) {
    await persistQualityReview({
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      review: input.review,
      status: "auto_fixed",
    });
  }

  return { applied: fields.length > 0, fields };
}
