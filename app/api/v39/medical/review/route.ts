import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { reviewMedicalContent } from "@/lib/v39/medical-review/engine";
import { persistMedicalReview } from "@/lib/v39/medical-review/persist";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      entity_type?: "lesson" | "course" | "article" | "video";
      entity_id?: string;
      title?: string;
      content?: string;
    };

    const admin = createServiceRoleClient();
    let title = body.title ?? "";
    let content = body.content ?? "";
    const entityType = body.entity_type ?? "lesson";
    const entityId = body.entity_id;

    if (entityId && !content) {
      if (entityType === "lesson") {
        const { data } = await admin.from("lessons").select("title, content").eq("id", entityId).maybeSingle();
        if (data) {
          title = data.title;
          content = data.content ?? "";
        }
      } else if (entityType === "course") {
        const { data } = await admin.from("courses").select("title, description").eq("id", entityId).maybeSingle();
        if (data) {
          title = data.title;
          content = data.description ?? "";
        }
      }
    }

    if (!title || !content) {
      return NextResponse.json({ error: "title a content (nebo entity_id) jsou povinné" }, { status: 400 });
    }

    const review = await reviewMedicalContent({ title, content, entityType });
    let reviewId: string | null = null;
    if (entityId) {
      reviewId = await persistMedicalReview({ entity_type: entityType, entity_id: entityId, review });
    }

    return NextResponse.json({
      ok: true,
      version: "v39.0",
      review_id: reviewId,
      review,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
