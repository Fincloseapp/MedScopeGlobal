#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const EN_RE = /Browse|Sign up|No published|Previous|Next|Category/i;

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) =>
    r.json()
  );
  const ls = await fetch(`${BASE}/api/v19/content/ls?limit=10`, { cache: "no-store" }).then((r) =>
    r.json()
  );
  const api = await fetch(`${BASE}/api/v20/studies?limit=8`, { cache: "no-store" }).then((r) =>
    r.json()
  );
  const list = await fetch(`${BASE}/studie?_${Date.now()}`, { cache: "no-store" }).then((r) =>
    r.text()
  );
  const home = await fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());

  const slug = api.studies?.[0]?.slug;
  let detail = "";
  if (slug) {
    detail = await fetch(`${BASE}/studie/${slug}?_${Date.now()}`, { cache: "no-store" }).then(
      (r) => r.text()
    );
  }

  const ok =
    health.version === "v19.9" &&
    health.uiVersion === "v20.2" &&
    (ls.deepRegistries?.counts?.topic ?? 0) > 0 &&
    api.uiVersion === "v20.2" &&
    (api.studies?.length ?? 0) >= 4 &&
    list.includes("v20-study-card") &&
    home.includes("Nejnovější medicínské studie") &&
    detail.includes("Metodika") &&
    detail.includes("Závěr") &&
    !EN_RE.test(list) &&
    !EN_RE.test(detail);

  console.log({
    health: health.version,
    uiVersion: health.uiVersion,
    studiesApi: api.count,
    homeSection: home.includes("Nejnovější medicínské studie"),
    detailOk: detail.includes("Metodika"),
    slug,
  });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
