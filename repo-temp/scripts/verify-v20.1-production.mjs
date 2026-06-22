#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const UI_BUILD = "v20.1-ui-20260608";
const EN_RE = /Browse articles|Sign up|Medical intelligence|All articles/i;

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) =>
    r.json()
  );
  const ls = await fetch(`${BASE}/api/v19/content/ls?limit=10`, { cache: "no-store" }).then((r) =>
    r.json()
  );
  const arts = await fetch(`${BASE}/api/v19/articles?locale=cs&limit=8&deepLink=1`, {
    cache: "no-store",
  }).then((r) => r.json());
  const home = await fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const briefy = await fetch(`${BASE}/odborne/briefy?_${Date.now()}`, { cache: "no-store" }).then(
    (r) => r.text()
  );

  const sample = arts.articles?.[0];
  const ok =
    health.version === "v19.9" &&
    health.uiVersion === "v20.1" &&
    (ls.deepRegistries?.counts?.topic ?? 0) > 0 &&
    arts.uiVersion === "v20.1" &&
    home.includes(UI_BUILD) &&
    home.includes('data-ui-version="v20.1"') &&
    !EN_RE.test(home) &&
    !EN_RE.test(briefy) &&
    briefy.includes("data-v20-ui");

  console.log({
    health: health.version,
    uiVersion: health.uiVersion,
    uiBuild: health.uiBuild,
    topics: ls.deepRegistries?.counts?.topic,
    articlesUi: arts.uiVersion,
    articleMeta: sample?.metaTitle ? "yes" : "no",
    homeBuild: home.includes(UI_BUILD),
    noEn: !EN_RE.test(home),
    briefyV20: briefy.includes("data-v20-ui"),
  });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
