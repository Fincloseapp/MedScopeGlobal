/**
 * v27.3 — aggressive image purge: scan DB, content HTML, and Supabase storage.
 */
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  extractContentImageUrls,
  isPurgeableImageUrl,
} from "@/lib/v25/images/legacy-images";
import { appendImageFixLog } from "@/lib/v25/images/persist";

export type ImagePurgeReport = {
  ok: boolean;
  scannedArticles: number;
  scannedOtherTables: number;
  coverUrlsNulled: number;
  otherUrlsNulled: number;
  contentImagesStripped: number;
  storageDeleted: number;
  storageSkipped: number;
  errors: string[];
  at: string;
};

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  cover_image_url: string | null;
  content: string | null;
};

type ContentTable = {
  table: string;
  imageColumn: string;
  slugColumn: string;
  contentColumn?: string;
};

const CONTENT_TABLES: ContentTable[] = [
  { table: "legislation_items", imageColumn: "image_url", slugColumn: "slug" },
  { table: "drug_news", imageColumn: "image_url", slugColumn: "slug" },
  { table: "university_news", imageColumn: "image_url", slugColumn: "slug" },
  { table: "studies", imageColumn: "image_url", slugColumn: "slug" },
  { table: "digital_health_items", imageColumn: "image_url", slugColumn: "slug" },
];

function storagePathFromPublicUrl(url: string): string | null {
  const m = url.match(/\/storage\/v1\/object\/public\/media\/(.+?)(?:\?|$)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

function stripBadImagesFromHtml(html: string): { html: string; removed: number } {
  let removed = 0;
  const next = html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (tag, src) => {
    if (isPurgeableImageUrl(src)) {
      removed += 1;
      return "";
    }
    return tag;
  });
  return { html: next, removed };
}

async function listStorageFiles(
  admin: ReturnType<typeof createServiceRoleClient>,
  prefix = "v25-images"
): Promise<string[]> {
  const paths: string[] = [];
  const queue = [prefix];

  while (queue.length > 0) {
    const folder = queue.shift()!;
    const { data, error } = await admin.storage.from("media").list(folder, { limit: 500 });
    if (error || !data) continue;

    for (const item of data) {
      const full = `${folder}/${item.name}`;
      if (!item.id && !item.metadata) {
        queue.push(full);
      } else if (isPurgeableImageUrl(full) || /\.svg$/i.test(item.name)) {
        paths.push(full);
      }
    }
  }

  return paths;
}

export async function runImagePurge(options?: {
  dryRun?: boolean;
  maxArticles?: number;
}): Promise<ImagePurgeReport> {
  const dryRun = options?.dryRun ?? false;
  const maxArticles = options?.maxArticles ?? 500;
  const errors: string[] = [];
  let coverUrlsNulled = 0;
  let otherUrlsNulled = 0;
  let contentImagesStripped = 0;
  let storageDeleted = 0;
  let storageSkipped = 0;
  let scannedOtherTables = 0;

  const admin = createServiceRoleClient();

  const { data: articles, error: artErr } = await admin
    .from("articles")
    .select("id, slug, title, cover_image_url, content")
    .order("updated_at", { ascending: false })
    .limit(maxArticles);

  if (artErr) {
    return {
      ok: false,
      scannedArticles: 0,
      scannedOtherTables: 0,
      coverUrlsNulled: 0,
      otherUrlsNulled: 0,
      contentImagesStripped: 0,
      storageDeleted: 0,
      storageSkipped: 0,
      errors: [artErr.message],
      at: new Date().toISOString(),
    };
  }

  const rows = (articles ?? []) as ArticleRow[];

  for (const row of rows) {
    const patch: Partial<ArticleRow> = {};
    let changed = false;

    if (row.cover_image_url && isPurgeableImageUrl(row.cover_image_url)) {
      patch.cover_image_url = null;
      coverUrlsNulled += 1;
      changed = true;
      appendImageFixLog({
        section: "articles",
        slug: row.slug,
        action: "assign",
        result: "ok",
        detail: `purge-cover${dryRun ? "-dry-run" : ""}: ${row.cover_image_url}`,
      });
    }

    if (row.content) {
      const badInContent = extractContentImageUrls(row.content).filter(isPurgeableImageUrl);
      if (badInContent.length > 0) {
        const { html, removed } = stripBadImagesFromHtml(row.content);
        if (removed > 0) {
          patch.content = html;
          contentImagesStripped += removed;
          changed = true;
        }
      }
    }

    if (changed && !dryRun) {
      const { error } = await admin.from("articles").update(patch).eq("id", row.id);
      if (error) errors.push(`${row.slug}: ${error.message}`);
    }
  }

  for (const cfg of CONTENT_TABLES) {
    const selectCols = `id, ${cfg.slugColumn}, ${cfg.imageColumn}`;
    const { data, error } = await admin
      .from(cfg.table)
      .select(selectCols)
      .order("updated_at", { ascending: false })
      .limit(200);

    if (error) {
      errors.push(`${cfg.table}: ${error.message}`);
      continue;
    }

    const tableRows = (data ?? []) as unknown as Record<string, unknown>[];
    for (const row of tableRows) {
      scannedOtherTables += 1;
      const imageUrl = row[cfg.imageColumn] ? String(row[cfg.imageColumn]) : null;
      if (!imageUrl || !isPurgeableImageUrl(imageUrl)) continue;

      otherUrlsNulled += 1;
      const slug = String(row[cfg.slugColumn] ?? row.id);
      appendImageFixLog({
        section: cfg.table,
        slug,
        action: "assign",
        result: "ok",
        detail: `purge-cover${dryRun ? "-dry-run" : ""}: ${imageUrl}`,
      });

      if (!dryRun) {
        const { error: upErr } = await admin
          .from(cfg.table)
          .update({ [cfg.imageColumn]: null })
          .eq("id", row.id);
        if (upErr) errors.push(`${cfg.table}/${slug}: ${upErr.message}`);
      }
    }
  }

  try {
    const badPaths = await listStorageFiles(admin);
    for (const path of badPaths) {
      if (dryRun) {
        storageSkipped += 1;
        continue;
      }
      const { error } = await admin.storage.from("media").remove([path]);
      if (error) {
        storageSkipped += 1;
        errors.push(`storage:${path}: ${error.message}`);
      } else {
        storageDeleted += 1;
      }
    }
  } catch (e) {
    errors.push(`storage-list: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    ok: errors.length === 0,
    scannedArticles: rows.length,
    scannedOtherTables,
    coverUrlsNulled,
    otherUrlsNulled,
    contentImagesStripped,
    storageDeleted,
    storageSkipped,
    errors,
    at: new Date().toISOString(),
  };
}

export { storagePathFromPublicUrl };
