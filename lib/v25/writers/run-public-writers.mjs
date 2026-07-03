#!/usr/bin/env node
/**
 * v25 — veřejné zdravotnické writery (4 redakce)
 * Ukládá do D:\medscope.data\public + Supabase (audience=public)
 */
import { appendLog } from "../shared.mjs";
import {
  savePublicArticleFile,
  persistPublicArticleToDb,
  updatePublicIndex,
  importAdEngine,
  DEFAULT_PUBLIC_WRITER_LIMIT,
  getSupabaseAdmin,
  getRecentPublicArticlesForDedup,
  resetRecentPublicArticlesCache,
} from "./writer-base.mjs";
import { runWriter1 } from "./writer1.mjs";
import { runWriter2 } from "./writer2.mjs";
import { runWriter3 } from "./writer3.mjs";
import { runWriter4 } from "./writer4.mjs";

async function assignPublicArticleCover(article, dbId) {
  if (!dbId) return null;
  try {
    const gen = await import("../images/generator-engine.mjs");
    const { uploadBufferToMedia, readImageBuffer } = await import("../images/upload-media.mjs");
    const saved = await gen.saveGeneratedImageAsync({
      section: "verejnost",
      slug: article.slug,
      title: article.title,
      module: "verejnost",
      keywords: article.keywords ?? [],
    });
    if (!saved.ok || !saved.relativePath) return null;

    const buf = readImageBuffer(saved.relativePath);
    const ct =
      saved.contentType ??
      (saved.relativePath.endsWith(".png") ? "image/png" : saved.relativePath.endsWith(".webp") ? "image/webp" : "image/jpeg");
    const publicUrl = buf ? await uploadBufferToMedia(saved.relativePath, buf, ct) : null;

    if (publicUrl) {
      const admin = getSupabaseAdmin();
      if (admin) await admin.from("articles").update({ cover_image_url: publicUrl }).eq("id", dbId);
    }
    return publicUrl;
  } catch (e) {
    appendLog("v25-public-writers.log", `cover image fail ${article.slug}: ${e.message}`);
    return null;
  }
}

const WRITERS = [
  { id: "writer1", run: runWriter1 },
  { id: "writer2", run: runWriter2 },
  { id: "writer3", run: runWriter3 },
  { id: "writer4", run: runWriter4 },
];

export async function runPublicWriters(options = {}) {
  const limitPerWriter = options.limitPerWriter ?? DEFAULT_PUBLIC_WRITER_LIMIT;
  const skipAds = options.skipAds === true;
  const t0 = Date.now();
  const report = {
    at: new Date().toISOString(),
    writers: [],
    articles: [],
    errors: [],
    persisted: { files: 0, db: 0, failed: 0 },
    editorial: { version: "26.2.1", similarityRejected: 0 },
  };

  resetRecentPublicArticlesCache();
  const recentArticles = await getRecentPublicArticlesForDedup();
  const batchArticles = [];

  let adEngine = null;
  let campaigns = [];
  if (!skipAds) {
    try {
      adEngine = await importAdEngine();
      campaigns = await adEngine.loadActiveCampaigns();
    } catch (e) {
      report.errors.push(`ad-engine load: ${e.message}`);
    }
  }

  for (let wi = 0; wi < WRITERS.length; wi++) {
    const w = WRITERS[wi];
    const writerReport = { id: w.id, generated: 0, saved: 0, dbOk: 0, errors: [] };
    try {
      const articles = await w.run({
        limit: limitPerWriter,
        writerIndex: wi,
        recentArticles,
        batchArticles,
      });
      writerReport.generated = articles.length;

      for (const article of articles) {
        let bodyHtml = article.bodyHtml;
        if (adEngine && campaigns.length) {
          const injected = adEngine.insertAdBlocks(bodyHtml, campaigns, {
            topic: article.topic,
          });
          bodyHtml = injected.html;
          article.bodyHtml = bodyHtml;
          article.adBlocks = injected.inserted;
        }

        savePublicArticleFile({ ...article, bodyHtml });
        report.persisted.files += 1;
        writerReport.saved += 1;

        const db = await persistPublicArticleToDb(article, bodyHtml);
        if (db.ok) {
          report.persisted.db += 1;
          writerReport.dbOk += 1;
          article.dbId = db.id;
          await assignPublicArticleCover(article, db.id);
        } else {
          report.persisted.failed += 1;
          writerReport.errors.push(`${article.slug}: ${db.reason}`);
        }

        report.articles.push({
          slug: article.slug,
          title: article.title,
          topic: article.topic,
          writer: w.id,
          persona: article.writerPersona,
          author: article.writerByline ?? article.writerDisplayName,
          similarityPassed: article.similarityCheck?.passed !== false,
        });
        if (article.similarityCheck?.passed === false) {
          report.editorial.similarityRejected += 1;
        }
      }
    } catch (e) {
      writerReport.errors.push(e.message);
      report.errors.push(`${w.id}: ${e.message}`);
    }
    report.writers.push(writerReport);
  }

  updatePublicIndex(report.articles.map((a) => ({ ...a, generatedAt: report.at })));
  report.durationMs = Date.now() - t0;
  report.ok = report.errors.length === 0 && report.persisted.files > 0;

  appendLog("v25-public-writers.log", `run ok=${report.ok} files=${report.persisted.files} db=${report.persisted.db} ${report.durationMs}ms`);
  return report;
}

const isMain = process.argv[1]?.includes("run-public-writers");
if (isMain) {
  runPublicWriters()
    .then((r) => {
      console.log(JSON.stringify(r, null, 2));
      process.exit(r.ok ? 0 : 1);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
