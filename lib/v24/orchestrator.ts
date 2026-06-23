import type { V24ContentDraft, V24PipelineResult, V24SectionId } from "@/lib/v24/types";
import { V24_MAX_REGENERATE_ATTEMPTS } from "@/lib/v24/config";
import { runV24QaPipeline } from "@/lib/v24/engines/qa";
import { runV24SeoPipeline } from "@/lib/v24/engines/seo";
import { runV24LegalPipeline } from "@/lib/v24/engines/legal";
import { checkGlobalDuplicate, registerTopic } from "@/lib/v24/engines/dedupe";
import { runV24ImagePipeline } from "@/lib/v24/engines/images";
import { recordContentHealth } from "@/lib/v24/engines/monitoring";
import { generateV24Draft } from "@/lib/v24/generator";
import { persistV24Artifact, publishV24ToWeb } from "@/lib/v24/persist";
import { getV24Section } from "@/lib/v24/sections";

export async function runV24Pipeline(
  draft: V24ContentDraft,
  existingTitles: string[] = []
): Promise<V24PipelineResult> {
  const errors: string[] = [];
  let current = draft;
  let regenerated = 0;
  let qa = runV24QaPipeline(current, existingTitles);
  let dedupe = checkGlobalDuplicate(current);

  while (
    regenerated < V24_MAX_REGENERATE_ATTEMPTS &&
    (!qa.passed || dedupe.duplicate)
  ) {
    regenerated += 1;
    current = generateV24Draft({
      section: current.section,
      index: regenerated,
      specialty: current.specialty,
      studyYear: current.studyYear,
      locale: current.locale,
      angleHint: `regen-${regenerated}`,
    });
    qa = runV24QaPipeline(current, existingTitles);
    dedupe = checkGlobalDuplicate(current);
  }

  if (!qa.passed) errors.push(...qa.issues);
  if (dedupe.duplicate) errors.push(dedupe.reason);

  const seo = runV24SeoPipeline(current);
  const legal = runV24LegalPipeline(current);
  if (!legal.passed) errors.push(...legal.issues);

  const image = runV24ImagePipeline(current);

  let coverImageUrl: string | null = null;
  try {
    const gen = await import("@/lib/v25/images/generator-engine.mjs");
    const saved = gen.saveGeneratedImage({
      section: current.section,
      slug: current.topicHash,
      title: current.title,
      keywords: current.keywords?.slice(0, 6),
    });
    if (saved.ok && saved.relativePath) {
      const { publicImageUrl } = await import("@/lib/v25/images/storage");
      const { uploadImageToMediaBucket } = await import("@/lib/v25/images/content-loader");
      const { readLocalImage } = await import("@/lib/v25/images/storage");
      const buf = readLocalImage(saved.relativePath);
      coverImageUrl =
        (buf ? await uploadImageToMediaBucket(saved.relativePath, buf) : null) ??
        publicImageUrl(saved.relativePath);
    }
  } catch {
    /* v25 image optional */
  }

  const disclaimerBlock = `<aside class="v24-disclaimer"><p>${legal.disclaimer}</p></aside>`;
  current.bodyHtml = `${current.bodyHtml}\n${disclaimerBlock}`;

  const artifactPath = persistV24Artifact(current, { qa, seo, legal, image });
  let published = false;

  if (qa.passed && !dedupe.duplicate && legal.passed) {
    try {
      await publishV24ToWeb(current, seo, coverImageUrl);
      registerTopic(current);
      published = true;
      recordContentHealth(current.section, qa.score, 1);
    } catch (e) {
      errors.push(`publish: ${(e as Error).message}`);
    }
  }

  return {
    ok: published,
    section: current.section,
    topicHash: current.topicHash,
    title: current.title,
    regenerated,
    qa,
    seo,
    legal,
    image,
    published,
    artifactPath,
    errors,
  };
}

export async function runV24SectionBatch(sectionId: V24SectionId) {
  const cfg = getV24Section(sectionId);
  if (!cfg) throw new Error(`Unknown section ${sectionId}`);

  const results: V24PipelineResult[] = [];
  const titles: string[] = [];

  for (let i = 0; i < cfg.batchSize; i++) {
    const specialty = cfg.specialties?.[i % (cfg.specialties.length || 1)];
    const studyYear = cfg.studyYears?.[i % (cfg.studyYears.length || 1)];
    const draft = generateV24Draft({
      section: sectionId,
      index: i,
      specialty,
      studyYear,
    });
    const result = await runV24Pipeline(draft, titles);
    titles.push(result.title);
    results.push(result);
  }

  return {
    section: sectionId,
    generated: results.filter((r) => r.published).length,
    failed: results.filter((r) => !r.published).length,
    results,
  };
}
