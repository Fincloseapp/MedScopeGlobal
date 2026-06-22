#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const UI_BUILD = "v20.0-ui-20260608";

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`).then((r) => r.json());
  const ls = await fetch(`${BASE}/api/v19/content/ls?limit=10`).then((r) => r.json());
  const arts = await fetch(`${BASE}/api/v19/articles?locale=cs&limit=8&deepLink=1`).then((r) =>
    r.json()
  );
  const home = await fetch(`${BASE}/?_=${Date.now()}`).then((r) => r.text());

  const ok =
    health.version === "v19.9" &&
    health.uiVersion === "v20.0" &&
    (ls.deepRegistries?.counts?.topic ?? 0) > 0 &&
    arts.uiVersion === "v20.0" &&
    home.includes(UI_BUILD) &&
    home.includes("data-ui-version=\"v20.0\"");

  console.log({
    health: health.version,
    uiVersion: health.uiVersion,
    topics: ls.deepRegistries?.counts?.topic,
    articlesUi: arts.uiVersion,
    homeBuild: home.includes(UI_BUILD),
  });
  console.log(ok ? "PASS" : "FAIL");
  process.exit(ok ? 0 : 1);
}

await check();
