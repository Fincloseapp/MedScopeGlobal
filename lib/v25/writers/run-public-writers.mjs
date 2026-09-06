#!/usr/bin/env node
/**
 * v25 — 20 seniorních veřejných writerů (5 kategorií × 4 specialisté)
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
import { runWriter5 } from "./writer5.mjs";
import { WRITER_SPECIALTY_IDS } from "./writer-roster.mjs";

async function assignPublicArticleCover(article, dbId) {
  if (!dbId) return null;
  try {
    const gen = await import("../images/generator-engine.mjs");
    const { uploadBufferToMedia, readImageBuffer } = await import("../images/upload-media.mjs");
    const imageTopic = article.internalTopic ?? article.topic;
    const saved = await gen.saveGeneratedImageAsync({
      section: "verejnost",
      slug: article.slug,
      title: article.title,
      module: imageTopic === "dlouhovekost" ? "verejnost" : "verejnost",
      keywords: [...(article.keywords ?? []), article.title, article.topicLabel ?? ""].filter(Boolean),
      metadata: {
        public_topic: imageTopic,
        content_pillar: article.contentPillar ?? null,
        excerpt: article.excerpt ?? null,
      },
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

const CATEGORY_RUNNERS = [
  { deskId: "writer1", run: runWriter1 },
  { deskId: "writer2", run: runWriter2 },
  { deskId: "writer3", run: runWriter3 },
  { deskId: "writer4", run: runWriter4 },
  { deskId: "writer5", run: runWriter5 },
];

const WRITERS = CATEGORY_RUNNERS.flatMap((desk, deskIndex) =>
  WRITER_SPECIALTY_IDS.map((specialty, specialtyIndex) => ({
    id: `${desk.deskId}-${specialty}`,
    deskId: desk.deskId,
    specialty,
    run: (opts) =>
      desk.run({
        ...opts,
        specialty,
        writerId: `${desk.deskId}-${specialty}`,
        writerIndex: deskIndex * WRITER_SPECIALTY_IDS.length + specialtyIndex,
        locale: opts.locale ?? "cs",
      }),
  }))
);

/** Primary foreign desks — one extra locale per UTC day so cron stays inside the Worker budget. */
export const FOREIGN_WRITER_ROTATION = [
  "sk",
  "pl",
  "de",
  "fr",
  "es",
  "pt",
  "pt-BR",
  "it",
  "en",
  "en-US",
  "en-UK",
  "ru",
  "uk",
  "zh-CN",
  "ja",
];

function parseWriterLocales(raw) {
  const list = String(raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return list;
}

export function rotatingForeignWriterLocale(now = new Date()) {
  const day = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
  return FOREIGN_WRITER_ROTATION[Math.abs(day) % FOREIGN_WRITER_ROTATION.length];
}

/** Czech every day. One rotating primary foreign desk unless PUBLIC_WRITER_LOCALES is set. */
export function defaultPublicWriterLocales(now = new Date()) {
  const fromEnv = parseWriterLocales(process.env.PUBLIC_WRITER_LOCALES);
  if (fromEnv.length) return fromEnv;
  const extra = rotatingForeignWriterLocale(now);
  return extra === "cs" ? ["cs"] : ["cs", extra];
}

/** GitHub dispatcher hours — partition the 20-writer roster so one Worker hit stays under the 1102 budget. */
export const CLOUDFLARE_CRON_HOUR_SLOTS = [4, 6, 7, 8, 12, 16, 20];

export function publicWriterSliceForHour(hourUtc, rosterSize = WRITERS.length) {
  const slots = CLOUDFLARE_CRON_HOUR_SLOTS;
  let slotIndex = 0;
  for (let i = 0; i < slots.length; i++) {
    if (hourUtc >= slots[i]) slotIndex = i;
  }
  const offset = Math.floor((slotIndex * rosterSize) / slots.length);
  const next =
    slotIndex + 1 < slots.length
      ? Math.floor(((slotIndex + 1) * rosterSize) / slots.length)
      : rosterSize;
  return { offset, limit: Math.max(1, next - offset) };
}

function resolveWriterRoster(options, now = new Date()) {
  const hasExplicitWindow =
    Number.isFinite(options.writerOffset) || Number.isFinite(options.writerLimit);
  if (hasExplicitWindow) {
    const offset = Math.max(0, Number(options.writerOffset) || 0);
    const limit = Number.isFinite(Number(options.writerLimit))
      ? Number(options.writerLimit)
      : WRITERS.length;
    return WRITERS.slice(offset, offset + Math.max(0, limit));
  }
  if (
    options.sliceByHour !== false &&
    process.env.MEDSCOPE_RUNTIME === "cloudflare-workers"
  ) {
    const window = publicWriterSliceForHour(now.getUTCHours());
    return WRITERS.slice(window.offset, window.offset + window.limit);
  }
  return WRITERS;
}

function writerLimitForLocale(locale, limitPerWriter) {
  if (locale === "cs") return limitPerWriter;
  return Math.min(1, limitPerWriter);
}

export async function runPublicWriters(options = {}) {
  const onCloudflare = process.env.MEDSCOPE_RUNTIME === "cloudflare-workers";
  const limitPerWriter = options.limitPerWriter ?? (onCloudflare ? 1 : DEFAULT_PUBLIC_WRITER_LIMIT);
  const skipAds = options.skipAds === true || (options.skipAds == null && onCloudflare);
  const skipCovers = options.skipCovers === true || (options.skipCovers == null && onCloudflare);
  const locales = options.locales ?? defaultPublicWriterLocales();
  const roster = resolveWriterRoster(options);
  const t0 = Date.now();
  const report = {
    at: new Date().toISOString(),
    writers: [],
    articles: [],
    errors: [],
    persisted: { files: 0, db: 0, failed: 0 },
    editorial: { version: "26.3.0", similarityRejected: 0, writers: roster.length, locales },
  };

  resetRecentPublicArticlesCache();
  try {
    const { runTodayPublicArticleRepairs } = await import("./repair-today-public.mjs");
    report.repairs = await runTodayPublicArticleRepairs();
  } catch (e) {
    report.errors.push(`today-repair: ${e.message}`);
  }
  if (options.repairOnly) {
    report.ok = report.errors.length === 0;
    report.durationMs = Date.now() - t0;
    appendLog(
      "v25-public-writers.log",
      `repair-only ok=${report.ok} repaired=${report.repairs?.repaired?.length ?? 0} unpublished=${report.repairs?.unpublished?.length ?? 0}`,
    );
    return report;
  }
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

  for (const locale of locales) {
  for (let wi = 0; wi < roster.length; wi++) {
    const w = roster[wi];
    const writerReport = { id: `${locale}:${w.id}`, generated: 0, saved: 0, dbOk: 0, errors: [] };
    try {
      const articles = await w.run({
        locale,
        limit: writerLimitForLocale(locale, limitPerWriter),
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
          if (!skipCovers) await assignPublicArticleCover(article, db.id);
        } else {
          report.persisted.failed += 1;
          writerReport.errors.push(`${article.slug}: ${db.reason}`);
        }

        report.articles.push({
          slug: article.slug,
          title: article.title,
          topic: article.topic,
          writer: w.id,
          specialty: article.specialty ?? w.specialty,
          persona: article.writerPersona,
          author: article.writerByline ?? article.writerDisplayName,
          similarityPassed: article.similarityCheck?.passed !== false,
          editorialReviewPassed: article.editorialReview?.passed !== false,
          locale: article.locale ?? locale,
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
