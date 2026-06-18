import { createServiceRoleClient } from "@/lib/supabase/service";
import type { MedicalReviewResult } from "@/lib/v39/medical-review/engine";

export type MedicalReviewRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  score: number;
  severity: string;
  review: MedicalReviewResult;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function persistMedicalReview(input: {
  entity_type: "lesson" | "course" | "article" | "video";
  entity_id: string;
  review: MedicalReviewResult;
  status?: string;
}): Promise<string | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("medical_reviews")
    .upsert(
      {
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        score: input.review.score,
        severity: input.review.severity,
        review: input.review,
        status: input.status ?? "reviewed",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "entity_type,entity_id" }
    )
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[v39] persistMedicalReview", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function listMedicalReviews(limit = 50): Promise<MedicalReviewRow[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("medical_reviews")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as MedicalReviewRow[];
}

export async function getMedicalReview(entityType: string, entityId: string) {
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("medical_reviews")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  return data;
}
