"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminEvent } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function saveCategory(input: {
  id?: string;
  name: string;
  slug?: string;
  description: string | null;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");
  const supabase = await createClient();
  const slug = input.slug?.trim() || slugify(input.name);
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
    await logAdminEvent("CATEGORY_UPDATE", { category_id: input.id });
  } else {
    const { data, error } = await supabase
      .from("categories")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    await logAdminEvent("CATEGORY_CREATE", { category_id: data.id });
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  await logAdminEvent("CATEGORY_DELETE", { category_id: id });
  revalidatePath("/");
  revalidatePath("/admin/categories");
}
