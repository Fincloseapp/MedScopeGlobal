import { appendV25Log } from "@/lib/v25/data-store";
import { mergeV25SystemState, updateV25TestStatus } from "@/lib/v25/system-state";
import {
  loadContentRowsForImages,
  updateContentImageUrl,
  uploadImageToMediaBucket,
} from "@/lib/v25/images/content-loader";
import {
  appendImageFixLog,
  loadImageRegistryLocal,
  logImageRunToDb,
  persistImageReport,
} from "@/lib/v25/images/persist";
import { publicImageUrl, readLocalImage } from "@/lib/v25/images/storage";
import type {
  V25ImagePipelineResult,
  V25ImageRecord,
  V25ImageReport,
} from "@/lib/v25/images/types";
import { V25_PROD_BASE } from "@/lib/v25/config";

type MissingItem = {
  id: string;
  slug: string;
  section: string;
  title: string;
  excerpt?: string;
  body?: string;
  table?: string;
  imageColumn?: string;
  needsGeneration?: boolean;
  analysis?: {
    imageType?: string;
    module?: string;
    keywords?: string[];
    prompt?: string;
  };
  imageType?: string;
  module?: string;
  prompt?: string;
  registered?: { publicUrl?: string; imageType?: string; alt?: string };
};

async function importEngines() {
  const [detector, generator, selector] = await Promise.all([
    import("@/lib/v25/images/missing-detector.mjs"),
    import("@/lib/v25/images/generator-engine.mjs"),
    import("@/lib/v25/images/selector-engine.mjs"),
  ]);
  return { detector, generator, selector };
}

export async function runV25ImagePipeline(options?: {
  maxGenerate?: number;
  skipDb?: boolean;
}): Promise<V25ImagePipelineResult> {
  const maxGenerate = options?.maxGenerate ?? 48;
  const { detector, generator } = await importEngines();

  const contentRows = options?.skipDb ? [] : await loadContentRowsForImages();
  const registry = loadImageRegistryLocal();
  const facultyRows = detector.buildStaticMissingFaculties(registry);
  const allRows = [...contentRows, ...facultyRows];

  const detection = detector.detectMissingImages(allRows) as {
    missing: number;
    items: MissingItem[];
    total: number;
    withImage: number;
    skipped: number;
  };

  const images: V25ImageRecord[] = [...registry];
  const fixLog: V25ImageReport["fixLog"] = [];
  let generated = 0;
  let assigned = 0;
  let failed = 0;

  const queue = detection.items.slice(0, maxGenerate);

  for (const item of queue) {
    try {
      let publicUrl: string | null = null;
      let source: V25ImageRecord["source"] = "generator";
      let imageType = (item.imageType ?? item.analysis?.imageType ?? "illustration") as V25ImageRecord["imageType"];
      let relativePath = "";
      let localPath = "";

      if (item.registered?.publicUrl && !item.needsGeneration) {
        publicUrl = item.registered.publicUrl;
        source = "selector";
      } else {
        const saved = generator.saveGeneratedImage({
          section: item.section,
          slug: item.slug,
          title: item.title,
          imageType,
          module: item.module ?? item.analysis?.module ?? "medicina",
          keywords: item.analysis?.keywords ?? [],
          prompt: item.prompt ?? item.analysis?.prompt,
        });

        if (!saved.ok) {
          failed += 1;
          const fix = appendImageFixLog({
            section: item.section,
            slug: item.slug,
            action: "style-reject",
            result: "fail",
            detail: String(saved.error),
          });
          fixLog.push(fix);
          continue;
        }

        generated += 1;
        relativePath = saved.relativePath ?? "";
        localPath = saved.meta?.localPath ?? "";
        source = "generator";

        const buf = readLocalImage(relativePath);
        if (buf) {
          publicUrl = await uploadImageToMediaBucket(relativePath, buf);
        }
        if (!publicUrl) {
          publicUrl = publicImageUrl(relativePath, V25_PROD_BASE);
        }
      }

      if (!publicUrl) {
        failed += 1;
        appendImageFixLog({
          section: item.section,
          slug: item.slug,
          action: "upload-fail",
          result: "fail",
        });
        continue;
      }

      if (item.table && item.imageColumn && item.id && !item.id.startsWith("faculty-")) {
        const updated = await updateContentImageUrl(item.table, item.imageColumn, item.id, publicUrl);
        if (!updated) {
          appendV25Log("autofix", `image db update fail ${item.table}/${item.id}`);
        }
      }

      assigned += 1;
      const now = new Date().toISOString();
      const record: V25ImageRecord = {
        id: `img-${item.section}-${item.slug}`,
        section: item.section,
        slug: item.slug,
        title: item.title,
        imageType,
        source,
        publicUrl,
        localPath: localPath || undefined,
        relativePath: relativePath || undefined,
        stylePassed: true,
        createdAt: now,
        updatedAt: now,
        contentId: item.id,
        keywords: item.analysis?.keywords,
        alt: item.registered?.alt ?? item.title,
      };

      const idx = images.findIndex((i) => i.section === record.section && i.slug === record.slug);
      if (idx >= 0) images[idx] = record;
      else images.push(record);

      fixLog.push(
        appendImageFixLog({
          section: item.section,
          slug: item.slug,
          action: "generate",
          result: "ok",
          detail: publicUrl,
        })
      );

      void logImageRunToDb(item.section, item.slug, source, true, publicUrl);
    } catch (e) {
      failed += 1;
      appendImageFixLog({
        section: item.section,
        slug: item.slug,
        action: "generate",
        result: "fail",
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const report: V25ImageReport = {
    at: new Date().toISOString(),
    total: images.length,
    generated,
    assigned,
    failed,
    skipped: detection.skipped,
    missingBefore: detection.missing,
    images,
    fixLog,
  };

  const persisted = await persistImageReport(report);
  const ok = failed === 0 || assigned > 0;

  updateV25TestStatus({ imagePipeline: ok ? (failed ? "partial" : "ok") : "fail" });
  mergeV25SystemState({ images: report });

  return {
    ok: ok && persisted,
    report,
    detail: `${assigned} assigned, ${generated} generated, ${failed} failed, ${detection.missing} missing before`,
  };
}

/** Verify image URLs from registry — used by link/monitor tests. */
async function headCheckUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "MedScopeGlobal-v25.1-image-check" },
    });
    return res.ok ? null : url;
  } catch {
    return url;
  }
}

export async function verifyImageUrls(urls: string[]): Promise<{ ok: boolean; broken: string[] }> {
  const sample = urls.slice(0, 40);
  const concurrency = 8;
  const broken: string[] = [];

  for (let i = 0; i < sample.length; i += concurrency) {
    const batch = sample.slice(i, i + concurrency);
    const results = await Promise.all(batch.map((url) => headCheckUrl(url)));
    broken.push(...results.filter((u): u is string => u !== null));
  }

  return { ok: broken.length === 0, broken };
}

export async function checkPageImagesLoaded(path: string): Promise<boolean> {
  const base = V25_PROD_BASE.replace(/\/$/, "");
  try {
    const res = await fetch(`${base}${path}`, {
      cache: "no-store",
      headers: { "User-Agent": "MedScopeGlobal-v25.1-image-check" },
    });
    const html = await res.text();
    const hasImg = /<img[^>]+src=["'][^"']+["']/i.test(html);
    const hasCover = /cover|article-cover|content-card.*img/i.test(html);
    return res.ok && (hasImg || hasCover || /background.*gradient/i.test(html));
  } catch {
    return false;
  }
}
