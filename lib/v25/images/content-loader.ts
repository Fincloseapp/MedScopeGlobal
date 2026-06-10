import { createServiceRoleClient } from "@/lib/supabase/service";
import type { V25ContentImageRow } from "@/lib/v25/images/types";

type TableConfig = {
  table: string;
  section: string;
  imageColumn: string;
  slugColumn: string;
  titleColumn: string;
  excerptColumn?: string;
  bodyColumn?: string;
  limit: number;
};

const TABLES: TableConfig[] = [
  {
    table: "articles",
    section: "articles",
    imageColumn: "cover_image_url",
    slugColumn: "slug",
    titleColumn: "title",
    excerptColumn: "excerpt",
    bodyColumn: "content",
    limit: 80,
  },
  {
    table: "legislation_items",
    section: "legislation",
    imageColumn: "image_url",
    slugColumn: "slug",
    titleColumn: "title",
    excerptColumn: "summary",
    limit: 60,
  },
  {
    table: "drug_news",
    section: "drug_news",
    imageColumn: "image_url",
    slugColumn: "slug",
    titleColumn: "title",
    excerptColumn: "summary",
    limit: 60,
  },
  {
    table: "university_news",
    section: "university_news",
    imageColumn: "image_url",
    slugColumn: "slug",
    titleColumn: "title",
    excerptColumn: "summary",
    limit: 40,
  },
  {
    table: "studies",
    section: "studies",
    imageColumn: "image_url",
    slugColumn: "slug",
    titleColumn: "title",
    excerptColumn: "summary",
    limit: 60,
  },
  {
    table: "digital_health_items",
    section: "digital_health",
    imageColumn: "image_url",
    slugColumn: "slug",
    titleColumn: "title",
    excerptColumn: "summary",
    limit: 40,
  },
];

export async function loadContentRowsForImages(): Promise<V25ContentImageRow[]> {
  const admin = createServiceRoleClient();
  const rows: V25ContentImageRow[] = [];

  for (const cfg of TABLES) {
    const cols = [
      "id",
      cfg.slugColumn,
      cfg.titleColumn,
      cfg.imageColumn,
      cfg.excerptColumn,
      cfg.bodyColumn,
    ]
      .filter(Boolean)
      .join(", ");

    const { data, error } = await admin
      .from(cfg.table)
      .select(cols)
      .order("created_at", { ascending: false })
      .limit(cfg.limit);

    if (error || !data) continue;

    for (const row of data as Record<string, unknown>[]) {
      rows.push({
        id: String(row.id),
        slug: String(row[cfg.slugColumn] ?? row.id),
        section: cfg.section,
        title: String(row[cfg.titleColumn] ?? "Bez názvu"),
        excerpt: cfg.excerptColumn ? String(row[cfg.excerptColumn] ?? "") : undefined,
        body: cfg.bodyColumn ? String(row[cfg.bodyColumn] ?? "") : undefined,
        imageUrl: row[cfg.imageColumn] ? String(row[cfg.imageColumn]) : null,
        table: cfg.table,
        imageColumn: cfg.imageColumn,
      });
    }
  }

  return rows;
}

export async function updateContentImageUrl(
  table: string,
  imageColumn: string,
  id: string,
  publicUrl: string
): Promise<boolean> {
  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.from(table).update({ [imageColumn]: publicUrl }).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function uploadImageToMediaBucket(
  relativePath: string,
  buffer: Buffer,
  contentType = "image/svg+xml"
): Promise<string | null> {
  try {
    const admin = createServiceRoleClient();
    const path = `v25-images/${relativePath.replace(/\\/g, "/")}`;
    const { error } = await admin.storage.from("media").upload(path, buffer, {
      contentType,
      upsert: true,
    });
    if (error) {
      console.error("[v25] media upload:", error.message);
      return null;
    }
    const { data } = admin.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error("[v25] media upload failed", e);
    return null;
  }
}
