import { EDITORIAL_TAXONOMY } from "@/lib/admin/taxonomy";
import { createAdminReadClient } from "@/lib/auth/require-admin-access";

export function editorialRowsToInsert(existingSlugs: string[]) {
  const have = new Set(existingSlugs);
  return EDITORIAL_TAXONOMY.filter((item) => !have.has(item.slug)).map((item) => ({
    name: item.name,
    slug: item.slug,
    description: item.description,
  }));
}

/** Insert only missing canonical rows. Never deletes, never overwrites names. */
export async function ensureMissingEditorialCategories(): Promise<number> {
  const client = await createAdminReadClient();
  if (!client) return 0;
  const { data, error } = await client.from("categories").select("slug");
  if (error || !data) return 0;
  const rows = editorialRowsToInsert(data.map((row) => String(row.slug)));
  if (rows.length === 0) return 0;
  const { error: insertError } = await client.from("categories").insert(rows);
  if (insertError) {
    console.error("ensureMissingEditorialCategories", insertError);
    return 0;
  }
  return rows.length;
}
