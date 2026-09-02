"use server";

import { revalidatePath } from "next/cache";
import { getAuthorizedAdminClient } from "@/lib/auth/require-admin-access";
import { EDITORIAL_TAXONOMY, slugifyCategory } from "@/lib/admin/taxonomy";
import { logAdminEvent } from "@/lib/logging";

export async function saveCategory(input: {
  id?: string;
  name: string;
  slug?: string;
  description: string | null;
}) {
  const supabase = await getAuthorizedAdminClient();
  const slug = input.slug?.trim() || slugifyCategory(input.name);
  if (!slug) throw new Error("Slug kategorie je prázdný.");
  const payload = {
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
  };

  if (input.id) {
    const { error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", input.id);
    if (error) throw error;
    await logAdminEvent("CATEGORY_UPDATE", { category_id: input.id, slug });
  } else {
    const { data, error } = await supabase
      .from("categories")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    await logAdminEvent("CATEGORY_CREATE", { category_id: data.id, slug });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await getAuthorizedAdminClient();
  const { count, error: countError } = await supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    throw new Error(`Kategorii nelze smazat — je u ní ${count} článků. Nejdřív je přesuňte.`);
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  await logAdminEvent("CATEGORY_DELETE", { category_id: id });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
}

/** Upsert missing V20 desks, Dlouhověkost, and medical specialty seeds. Never deletes used rows. */
export async function syncEditorialCategories(): Promise<{ upserted: number }> {
  const supabase = await getAuthorizedAdminClient();
  const rows = EDITORIAL_TAXONOMY.map((item) => ({
    name: item.name,
    slug: item.slug,
    description: item.description,
  }));
  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  await logAdminEvent("CATEGORY_SYNC_EDITORIAL", {
    upserted: rows.length,
    slugs: rows.map((row) => row.slug),
  });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  return { upserted: rows.length };
}
