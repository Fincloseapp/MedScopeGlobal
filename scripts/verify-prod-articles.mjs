#!/usr/bin/env node
/**
 * Auto-verify article hubs + apps on a target origin (default: production).
 * Usage:
 *   node scripts/verify-prod-articles.mjs
 *   MEDSCOPE_ORIGIN=http://localhost:3000 node scripts/verify-prod-articles.mjs
 */
const origin = (process.env.MEDSCOPE_ORIGIN || "https://medscopeglobal.com").replace(/\/$/, "");

async function get(path) {
  const url = `${origin}${path}${path.includes("?") ? "&" : "?"}_=${Date.now()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "MedScopeVerify/1.0", "Cache-Control": "no-cache" },
    redirect: "follow",
  });
  const body = await res.text();
  return { status: res.status, url: res.url, body };
}

function countVerejnost(body) {
  return new Set(body.match(/verejnost-[a-z0-9-]+/g) || []).size;
}

const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log(`Verifying ${origin}\n`);

  const home = await get("/");
  check("home_ok", home.status === 200 && !home.body.includes("Application error"));
  check("home_portal", home.body.includes("Zpravodajství"));
  check("home_articles", countVerejnost(home.body) >= 6, `slugs=${countVerejnost(home.body)}`);
  check("home_env_bridge", home.body.includes("__MEDSCOPE_PUBLIC__") || origin.includes("localhost"));

  const articles = await get("/articles");
  check("articles_list", articles.status === 200 && !articles.body.includes("Žádné aktivní články"));
  check("articles_cards", countVerejnost(articles.body) >= 10, `slugs=${countVerejnost(articles.body)}`);

  const verejnost = await get("/verejnost/clanky");
  check("verejnost_list", verejnost.status === 200 && !verejnost.body.includes("brzy objeví"));
  check("verejnost_cards", countVerejnost(verejnost.body) >= 10, `slugs=${countVerejnost(verejnost.body)}`);

  const slug = [...new Set(articles.body.match(/verejnost-[a-z0-9-]+/g) || [])][0];
  if (slug) {
    const detail = await get(`/article/${slug}`);
    check("article_detail", detail.status === 200 && detail.body.includes(slug.slice(0, 20)), slug.slice(0, 48));
  } else {
    check("article_detail", false, "no slug found");
  }

  for (const [path, label] of [
    ["/app/priprava", "mediprep"],
    ["/app/pacient", "medipacient"],
    ["/app/dokumentace", "mediktor"],
  ]) {
    const page = await get(path);
    check(`${label}_chrome`, page.status === 200 && page.body.includes("Platnost"));
  }

  // Optional redirects (only assert when hitting production build that includes them)
  const studenti = await get("/studenti/clanky");
  check(
    "studenti_clanky_reachable",
    studenti.status === 200 && (studenti.url.includes("/articles") || studenti.body.includes("Články")),
    studenti.url
  );

  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\nRESULT: ${failed === 0 ? "ALL_PASS" : `${failed}_FAILED`} (${checks.length} checks)`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
