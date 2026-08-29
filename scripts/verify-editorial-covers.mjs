#!/usr/bin/env node
/**
 * Smoke: article listing must not serve banned covers (brain-on-stick, etc.).
 * Usage:
 *   node scripts/verify-editorial-covers.mjs
 *   MEDSCOPE_ORIGIN=http://localhost:3000 node scripts/verify-editorial-covers.mjs
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const {
  BANNED_COVER_IDS,
  COVER_ASSET_VERSION,
  EDITORIAL_IMAGE_POLICY_VERSION,
  isBannedCoverUrl,
  resolveEditorialCover,
} = await import(pathToFileURL(join(root, "lib/editorial/image-policy.mjs")).href);

const origin = (process.env.MEDSCOPE_ORIGIN || "https://medscopeglobal.com").replace(/\/$/, "");

let failed = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed += 1;
}

const brain =
  "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=675&fit=crop";
check("policy_bans_brain_url", isBannedCoverUrl(brain) === true);
check(
  "policy_replaces_brain",
  !String(resolveEditorialCover({ coverUrl: brain, slug: "test-brain", title: "Mozek" })).includes(
    "0eb30cd8c063"
  )
);
check(
  "policy_laptop_brand",
  /medscopeglobal|assistant-brunette/i.test(
    resolveEditorialCover({
      coverUrl: null,
      title: "Digitální zdraví u laptopu",
      slug: "digital-laptop",
    })
  )
);
check("policy_version", Boolean(EDITORIAL_IMAGE_POLICY_VERSION));
check("policy_cache_bust", Boolean(COVER_ASSET_VERSION));
check(
  "policy_blocks_remote_unsplash",
  isBannedCoverUrl("https://images.unsplash.com/photo-1584515930387-285e4804f4cb") === true
);

const liveSeniors = join(root, "public/assets/covers/seniors.webp");
const liveVitals = join(root, "public/assets/covers/vitals.webp");
const qDir = "D:/medscope.data/cover-quarantine-20260829";
if (existsSync(liveSeniors) && existsSync(join(qDir, "seniors-brain-on-stick.webp"))) {
  const a = readFileSync(liveSeniors);
  const b = readFileSync(join(qDir, "seniors-brain-on-stick.webp"));
  check("local_seniors_not_brain_bytes", Buffer.compare(a, b) !== 0, `sizes ${a.length} vs ${b.length}`);
}
if (existsSync(liveVitals) && existsSync(join(qDir, "vitals-brain-on-stick.webp"))) {
  const a = readFileSync(liveVitals);
  const b = readFileSync(join(qDir, "vitals-brain-on-stick.webp"));
  check("local_vitals_not_brain_bytes", Buffer.compare(a, b) !== 0, `sizes ${a.length} vs ${b.length}`);
}
if (existsSync(liveSeniors)) {
  check("local_seniors_exists", statSync(liveSeniors).size > 1000);
}

const paths = ["/articles", "/"];
let html = "";
let status = 0;
let usedPath = paths[0];

for (const p of paths) {
  try {
    const res = await fetch(`${origin}${p}?_=${Date.now()}`, {
      headers: { "User-Agent": "MedScopeEditorialCoverVerify/2.0", Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(45000),
    });
    status = res.status;
    html = await res.text();
    usedPath = p;
    if (res.status === 200 && html.length > 500) break;
  } catch (e) {
    status = 0;
    html = String(e?.message || e);
  }
}

check("articles_http_200", status === 200, `${usedPath} status=${status} len=${html.length}`);

const bannedHits = BANNED_COVER_IDS.filter((id) => html.includes(id));
check("no_banned_ids_in_html", bannedHits.length === 0, bannedHits.join(", ") || "none");

const imgUrls = [
  ...html.matchAll(
    /(?:src|content)=["']([^"']*(?:unsplash|wikimedia|photo-|Brain_|assets\/)[^"']*)["']/gi
  ),
].map((m) => m[1]);
const bannedImgs = imgUrls.filter((u) => isBannedCoverUrl(u));
check("no_banned_img_src", bannedImgs.length === 0, bannedImgs.slice(0, 3).join(" | ") || "none");

// Live seniors.webp must not equal quarantined brain bytes
try {
  const live = await fetch(`${origin}/assets/covers/seniors.webp?v=${COVER_ASSET_VERSION}&_=${Date.now()}`);
  const buf = Buffer.from(await live.arrayBuffer());
  check("live_seniors_http", live.ok && buf.length > 1000, `status=${live.status} len=${buf.length}`);
  if (existsSync(join(qDir, "seniors-brain-on-stick.webp"))) {
    const old = readFileSync(join(qDir, "seniors-brain-on-stick.webp"));
    check("live_seniors_not_brain_bytes", Buffer.compare(buf, old) !== 0, `live=${buf.length} old=${old.length}`);
  }
} catch (e) {
  check("live_seniors_http", false, String(e.message || e));
}

console.log(`\nPolicy ${EDITORIAL_IMAGE_POLICY_VERSION} @ ${origin}${usedPath}`);
console.log(`RESULT: ${failed === 0 ? "ALL_PASS" : `${failed}_FAILED`}`);
process.exit(failed === 0 ? 0 : 1);
