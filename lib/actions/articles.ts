"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  buildEditorialMetadataPatch,
  formatEditorialUnitDisplay,
  type EditorialUnitId,
} from "@/lib/editorial/units";
import { logAdminEvent } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function saveArticle(input: {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category_id: string;
  cover_image_url: string | null;
  published: boolean;
  vip_only: boolean;
  editorial_unit_primary?: EditorialUnitId;
  editorial_unit_reviewer?: EditorialUnitId | null;
  ai_assisted?: boolean;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");

  const supabase = await createClient();
  const slug = input.slug?.trim() || slugify(input.title);
  const published_at = input.published ? new Date().toISOString() : null;

  const primary = input.editorial_unit_primary ?? "medscope_global_editorial_board";
  const aiAssisted = input.ai_assisted ?? true;
  const editorialMeta = buildEditorialMetadataPatch({
    primary,
    reviewer: input.editorial_unit_reviewer ?? undefined,
    aiAssisted,
  });
  const sourceName = formatEditorialUnitDisplay(primary, "cs", aiAssisted);

  const basePayload = {
    title: input.title.trim(),
    slug,
    excerpt: input.excerpt.trim() || null,
    content: input.content,
    category_id: input.category_id,
    cover_image_url: input.cover_image_url,
    published: input.published,
    vip_only: input.vip_only,
    published_at,
    updated_at: new Date().toISOString(),
    ai_generated: aiAssisted,
    source_name: sourceName,
  };

  if (input.id) {
    const { data: existing } = await supabase
      .from("articles")
      .select("metadata")
      .eq("id", input.id)
      .maybeSingle();

    const { error } = await supabase
      .from("articles")
      .update({
        ...basePayload,
        metadata: { ...(existing?.metadata ?? {}), ...editorialMeta },
      })
      .eq("id", input.id);
    if (error) throw error;
    await logAdminEvent("ARTICLE_UPDATE", {
      article_id: input.id,
      slug: basePayload.slug,
    });
  } else {
    const { data, error } = await supabase
      .from("articles")
      .insert({
        ...basePayload,
        author_id: gate.user.id,
        metadata: editorialMeta,
      })
      .select("id")
      .single();
    if (error) throw error;
    await logAdminEvent("ARTICLE_CREATE", {
      article_id: data.id,
      slug: basePayload.slug,
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/articles");
}

export async function deleteArticle(id: string) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw error;
  await logAdminEvent("ARTICLE_DELETE", { article_id: id });
  revalidatePath("/");
  revalidatePath("/admin/articles");
}

export async function articleListAction(formData: FormData) {
  const intent = formData.get("intent");
  const id = String(formData.get("id"));
  if (!id) {
    throw new Error("Missing article id");
  }
  if (intent === "delete") {
    await deleteArticle(id);
    return;
  }
  if (intent === "toggle") {
    const published = formData.get("published") === "true";
    await toggleArticlePublished(id, published);
  }
}

export async function toggleArticlePublished(id: string, published: boolean) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");
  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update({
      published,
      published_at: published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  await logAdminEvent("ARTICLE_PUBLISH", { article_id: id, published });
  revalidatePath("/");
  revalidatePath("/admin/articles");
}
