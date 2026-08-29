#!/usr/bin/env node
/**
 * Smoke: article listing must not serve banned covers (brain-on-stick, etc.).
 * Usage:
 *   node scripts/verify-editorial-covers.mjs
 *   MEDSCOPE_ORIGIN=http://localhost:3000 node scripts/verify-editorial-covers.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const {
  BANNED_COVER_IDS,
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

// Unit: policy gates
const brain =
  "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=675&fit=crop";
check("policy_bans_brain_url", isBannedCoverUrl(brain) === true);
check(
  "policy_replaces_brain",
  !isBannedCoverUrl(resolveEditorialCover({ coverUrl: brain, slug: "test-brain", title: "Mozek" }))
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

// Live HTML
const paths = ["/cs/articles", "/articles"];
let html = "";
let status = 0;
let usedPath = paths[0];

for (const p of paths) {
  try {
    const res = await fetch(`${origin}${p}?_=${Date.now()}`, {
      headers: { "User-Agent": "MedScopeEditorialCoverVerify/1.0", Accept: "text/html" },
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

console.log(`\nPolicy ${EDITORIAL_IMAGE_POLICY_VERSION} @ ${origin}${usedPath}`);
console.log(`RESULT: ${failed === 0 ? "ALL_PASS" : `${failed}_FAILED`}`);
process.exit(failed === 0 ? 0 : 1);
