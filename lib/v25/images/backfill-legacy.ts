import {
  loadContentRowsForImages,
  loadStaticQuizImageRows,
  updateContentImageUrl,
  uploadImageToMediaBucket,
} from "@/lib/v25/images/content-loader";

import { isLegacyImageUrl } from "@/lib/v25/images/legacy-images";

import { appendImageFixLog, loadImageRegistryLocal, persistImageReport } from "@/lib/v25/images/persist";

import { publicImageUrl, readLocalImage } from "@/lib/v25/images/storage";

import type { V25ImageRecord } from "@/lib/v25/images/types";



type GenModule = {
  saveGeneratedImageAsync: (input: {
    section: string;
    slug: string;
    title: string;
    module?: string;
    keywords?: string[];
    category?: string;
    metadata?: Record<string, unknown>;
  }) => Promise<{ ok: boolean; relativePath?: string; error?: string; contentType?: string }>;
};

async function moduleForRow(row: {
  section: string;
  title: string;
  excerpt?: string;
  slug?: string;
  metadata?: Record<string, unknown>;
}) {
  const { analyzeContent } = await import("@/lib/v25/images/selector-engine.mjs");
  const analysis = analyzeContent({
    title: row.title,
    excerpt: row.excerpt,
    body: row.slug ? `slug:${row.slug}` : undefined,
    section: row.section,
    metadata: row.metadata,
  });
  return analysis.module ?? "medicina";
}



function contentTypeForPath(path: string, fallback?: string) {

  if (fallback) return fallback;

  if (path.endsWith(".png")) return "image/png";

  if (path.endsWith(".webp")) return "image/webp";

  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";

  return "image/svg+xml";

}



/** Nahradí legacy/placeholder URL v Supabase v25 raster fotografiemi. */

export async function runLegacyImageBackfill(maxItems = 64) {

  const rows = [...(await loadContentRowsForImages()), ...loadStaticQuizImageRows()].filter((r) =>
    isLegacyImageUrl(r.imageUrl)
  );

  const gen = (await import("@/lib/v25/images/generator-engine.mjs")) as GenModule;

  const registry = loadImageRegistryLocal();

  let updated = 0;

  let failed = 0;



  for (const row of rows.slice(0, maxItems)) {

    try {

      const existing = registry.find((i) => i.section === row.section && i.slug === row.slug);

      let publicUrl =

        existing?.publicUrl && !isLegacyImageUrl(existing.publicUrl) ? existing.publicUrl : null;



      if (!publicUrl) {

        const mod = await moduleForRow(row);
        const saved = await gen.saveGeneratedImageAsync({
          section: row.section,
          slug: row.slug,
          title: row.title,
          module: mod,
          keywords: row.excerpt?.split(/\s+/).slice(0, 6) ?? [],
          category: row.metadata?.publicTopic as string | undefined,
          metadata: row.metadata,
        });

        if (!saved.ok || !saved.relativePath) {

          failed += 1;

          continue;

        }

        const buf = readLocalImage(saved.relativePath);

        publicUrl =

          (buf

            ? await uploadImageToMediaBucket(

                saved.relativePath,

                buf,

                contentTypeForPath(saved.relativePath, saved.contentType)

              )

            : null) ?? publicImageUrl(saved.relativePath);

      }



      const ok = await updateContentImageUrl(row.table, row.imageColumn, row.id, publicUrl);

      if (!ok) {

        failed += 1;

        continue;

      }



      updated += 1;

      const now = new Date().toISOString();

      const record: V25ImageRecord = {

        id: `img-${row.section}-${row.slug}`,

        section: row.section,

        slug: row.slug,

        title: row.title,

        imageType: "illustration",

        source: "generator",

        publicUrl,

        stylePassed: true,

        createdAt: now,

        updatedAt: now,

        contentId: row.id,

      };

      const idx = registry.findIndex((i) => i.section === record.section && i.slug === record.slug);

      if (idx >= 0) registry[idx] = record;

      else registry.push(record);



      appendImageFixLog({

        section: row.section,

        slug: row.slug,

        action: "assign",

        result: "ok",

        detail: `legacy-backfill → ${publicUrl}`,

      });

    } catch {

      failed += 1;

    }

  }



  if (updated > 0) {

    await persistImageReport({

      at: new Date().toISOString(),

      total: registry.length,

      generated: updated,

      assigned: updated,

      failed,

      skipped: 0,

      missingBefore: rows.length,

      images: registry,

      fixLog: [],

    });

  }



  return { legacyFound: rows.length, updated, failed };

}


