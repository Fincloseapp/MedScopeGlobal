#!/usr/bin/env node
/**
 * Production polish verification — listings, covers, article UX, Stripe donate.
 *
 *   MEDSCOPE_ORIGIN=https://medscopeglobal.com pnpm exec tsx scripts/production-polish-verify.mjs
 *   pnpm exec tsx scripts/production-polish-verify.mjs --write-artifacts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = "/opt/cursor/artifacts";
const ORIGIN = (
  process.argv.find((a) => a.startsWith("--origin="))?.split("=")[1] ??
  process.env.MEDSCOPE_ORIGIN ??
  "https://medscopeglobal.com"
).replace(/\/$/, "");
const WRITE = process.argv.includes("--write-artifacts");

const LISTINGS = ["/cs/articles", "/articles", "/cs", "/verejnost/clanky"];
const STUB_RE =
  /zahraniční zpravodajství|foreign news|plný text článku brzy|full article text coming soon/i;

function countWords(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function extractSlugs(html) {
  const slugs = new Set();
  const re = /href="[^"]*\/article\/([^"?#]+)/g;
  let m;
  while ((m = re.exec(html))) {
    const slug = decodeURIComponent(m[1]).replace(/\/$/, "");
    if (slug && !slug.includes("missing")) slugs.add(slug);
  }
  return [...slugs];
}

function extractArticleProse(html) {
  const m = html.match(/class="article-prose[\s\S]*?<\/div>/i);
  if (m) return m[0];
  const col = html.match(/article-body-column[\s\S]{0,80000}/i);
  return col?.[0] ?? "";
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? null;
}

async function fetchText(path) {
  const res = await fetch(`${ORIGIN}${path}`, {
    headers: { "User-Agent": "MedScopePolishVerify/1.0", Accept: "text/html" },
    redirect: "follow",
  });
  return { status: res.status, body: await res.text(), url: res.url };
}

async function loadCoverHelpers() {
  return await import("../lib/ecosystem/editorial/images/cover.ts");
}

function extractListingCards(html) {
  const cards = [];
  const blocks = html.split(/<article[^>]*group flex h-full/i);
  for (const block of blocks.slice(1)) {
    const slugMatch = block.match(/href="\/article\/([^"]+)"/);
    const imgMatch = block.match(/<img[^>]+src="([^"]+)"/);
    const titleMatch = block.match(
      /font-display[^>]*font-semibold[^>]*>([^<]+)/i
    );
    if (!slugMatch || !imgMatch) continue;
    let coverPath = imgMatch[1].split("?")[0];
    try {
      coverPath = new URL(coverPath, ORIGIN).pathname;
    } catch {
      /* keep relative */
    }
    cards.push({
      slug: decodeURIComponent(slugMatch[1]),
      title: titleMatch?.[1]?.replace(/\s+/g, " ").trim() ?? slugMatch[1],
      coverPath,
    });
  }
  return cards;
}

const LIFESTYLE_TOPICS = new Set(["food", "sleep", "calm", "movement", "walk", "seniors"]);

async function main() {
  const helpers = await loadCoverHelpers();
  const report = {
    origin: ORIGIN,
    scrapedAt: new Date().toISOString(),
    listings: {},
    listingCoverViolations: [],
    articles: { sampled: 0, shortInListing: [], coverMismatches: [], stubPhrases: [], uxIssues: [] },
    stripe: null,
    smoke: { production: "not-run", ecosystem: "not-run" },
    pass: true,
  };

  const allSlugs = new Set();
  for (const path of LISTINGS) {
    const { status, body } = await fetchText(path);
    const slugs = status === 200 ? extractSlugs(body) : [];
    slugs.forEach((s) => allSlugs.add(s));
    report.listings[path] = { status, slugCount: slugs.length };

    if (path === "/cs/articles" && status === 200) {
      const cards = extractListingCards(body);
      report.listings[path].cardsChecked = cards.length;
      for (const card of cards) {
        const expected = helpers.classifyCoverTopic({
          title: card.title,
          slug: card.slug,
        });
        if (helpers.isBrainScanCoverUrl(card.coverPath)) {
          report.listingCoverViolations.push({
            slug: card.slug,
            title: card.title.slice(0, 72),
            issue: "brain-scan-clinical-webp",
            coverPath: card.coverPath,
          });
          report.pass = false;
        }
        if (
          LIFESTYLE_TOPICS.has(expected) &&
          helpers.isClinicalOrBrainCoverUrl(card.coverPath)
        ) {
          report.listingCoverViolations.push({
            slug: card.slug,
            title: card.title.slice(0, 72),
            issue: `clinical-on-${expected}`,
            coverPath: card.coverPath,
            expected,
          });
          report.pass = false;
        }
      }
      report.listings[path].coverViolations = report.listingCoverViolations.length;
    }

    if (status !== 200) report.pass = false;
  }

  const sample = [...allSlugs].sort().slice(0, 30);
  report.articles.sampled = sample.length;

  for (const slug of sample) {
    const { status, body } = await fetchText(`/cs/article/${slug}`);
    if (status !== 200) {
      report.articles.uxIssues.push({ slug, issue: `http-${status}` });
      report.pass = false;
      continue;
    }
    const title = extractH1(body) ?? slug;
    const prose = extractArticleProse(body);
    const words = countWords(prose);
    if (words < 800) {
      report.articles.shortInListing.push({ slug, words, title: title.slice(0, 72) });
      report.pass = false;
    }
    if (STUB_RE.test(body)) {
      report.articles.stubPhrases.push({ slug, title: title.slice(0, 72) });
      report.pass = false;
    }
    if (/Tringelt/i.test(body)) {
      report.articles.uxIssues.push({ slug, issue: "tringelt-branding" });
      report.pass = false;
    }
    const poslechnoutButtons = (body.match(/aria-label="Poslechnout článek"/g) ?? []).length;
    if (poslechnoutButtons > 1) {
      report.articles.uxIssues.push({ slug, issue: `duplicate-tts-${poslechnoutButtons}` });
      report.pass = false;
    }
    if (!/Kč|Příspěvek|Darovat/i.test(body)) {
      report.articles.uxIssues.push({ slug, issue: "missing-tip-kc" });
    }

    const ogMatch = body.match(/property="og:image"[^>]+content="([^"]+)"/i);
    const ogImage = ogMatch?.[1] ?? null;
    let coverPath = ogImage;
    try {
      coverPath = ogImage ? new URL(ogImage).pathname : null;
    } catch {
      /* keep raw */
    }
    const expected = helpers.classifyCoverTopic({ title, slug });
    if (coverPath && helpers.isMismatchedLocalCover(coverPath, expected)) {
      report.articles.coverMismatches.push({ slug, title: title.slice(0, 72), expected, coverPath });
      report.pass = false;
    }
    if (coverPath && helpers.isBrainScanCoverUrl(coverPath)) {
      report.articles.coverMismatches.push({
        slug,
        title: title.slice(0, 72),
        expected: "no-brain-scan",
        coverPath,
      });
      report.pass = false;
    }
    if (coverPath && helpers.isDeniedStockUrl(coverPath)) {
      report.articles.coverMismatches.push({
        slug,
        title: title.slice(0, 72),
        expected: "denied-stock",
        coverPath,
      });
      report.pass = false;
    }
  }

  try {
    const t0 = Date.now();
    const res = await fetch(`${ORIGIN}/api/ecosystem/donate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: 2000, currency: "czk" }),
      signal: AbortSignal.timeout(20_000),
    });
    const ms = Date.now() - t0;
    const body = await res.json().catch(() => ({}));
    report.stripe = {
      status: res.status,
      ms,
      hasCheckoutUrl: typeof body?.url === "string" && body.url.includes("checkout.stripe.com"),
    };
    if (ms > 15_000 || (!report.stripe.hasCheckoutUrl && res.status !== 503)) {
      report.pass = false;
    }
  } catch (e) {
    report.stripe = { error: e instanceof Error ? e.message : String(e) };
    report.pass = false;
  }

  const summary = [
    `# Production polish verification`,
    ``,
    `- Origin: ${ORIGIN}`,
    `- Time: ${report.scrapedAt}`,
    `- Overall: ${report.pass ? "PASS" : "FAIL"}`,
    ``,
    `## Listings`,
    ...Object.entries(report.listings).map(
      ([p, v]) => `- ${p}: HTTP ${v.status}, ${v.slugCount} article slugs`
    ),
    ``,
    `## Articles (sample ${report.articles.sampled})`,
    `- Short in listing (<800w): ${report.articles.shortInListing.length}`,
    `- Stub phrases: ${report.articles.stubPhrases.length}`,
    `- Cover mismatches: ${report.articles.coverMismatches.length}`,
    `- Listing cover violations (/cs/articles): ${report.listingCoverViolations.length}`,
    `- UX issues: ${report.articles.uxIssues.length}`,
    ``,
    `## Stripe donate`,
    `- ${JSON.stringify(report.stripe)}`,
    ``,
  ].join("\n");

  console.log(summary);
  if (report.listingCoverViolations.length) {
    console.log(
      "Listing cover violations:",
      JSON.stringify(report.listingCoverViolations, null, 2)
    );
  }
  if (report.articles.coverMismatches.length) {
    console.log("Cover mismatches:", JSON.stringify(report.articles.coverMismatches, null, 2));
  }
  if (report.articles.shortInListing.length) {
    console.log("Short in listing:", JSON.stringify(report.articles.shortInListing, null, 2));
  }

  if (WRITE) {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
    writeFileSync(join(ARTIFACT_DIR, "production-polish-report.json"), JSON.stringify(report, null, 2));
    writeFileSync(join(ARTIFACT_DIR, "production-polish-summary.md"), summary);
    console.log(`Wrote artifacts to ${ARTIFACT_DIR}`);
  }

  process.exit(report.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
