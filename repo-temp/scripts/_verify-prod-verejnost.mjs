const base = "https://medscopeglobal.com";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(path) {
  const res = await fetch(`${base}${path}`, {
    redirect: "follow",
    headers: { "User-Agent": "MedScopeGlobal-verify-verejnost" },
  });
  return { status: res.status, html: await res.text() };
}

function extractSlugs(html, prefix) {
  const re = new RegExp(`${prefix}[a-z0-9-]+`, "g");
  return [...new Set(html.match(re) ?? [])].slice(0, 5);
}

async function analyzePage(path, label) {
  const { status, html } = await fetchText(path);
  const imgSrcs = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]).filter((s) => s.includes("image") || s.includes("unsplash") || s.includes("render") || s.includes("supabase"));
  return {
    label,
    path,
    status,
    hasRender: html.includes("/api/v25/images/render"),
    hasV251: /Neutral.*European|MedScopeGlobal v25\.1/.test(html),
    hasUnsplash: html.includes("images.unsplash.com"),
    hasExpand: html.includes("Klikněte pro celý článek") || html.includes("aria-expanded"),
    sampleImages: imgSrcs.slice(0, 3),
  };
}

async function main() {
  let health = {};
  try {
    health = await fetch(`${base}/api/v19/health`).then((r) => r.json());
  } catch (e) {
    health = { error: String(e) };
  }

  console.log("HEALTH", JSON.stringify({ gitSha: health.gitSha ?? health.sha, ok: health.ok }));

  const clanky = await fetchText("/verejnost/clanky");
  const articleSlugs = extractSlugs(clanky.html, "/verejnost/clanky/verejnost-");
  const quizSlugs = extractSlugs(await fetchText("/kvizy").then((r) => r.html), "/kvizy/");

  const pages = [
    ["/verejnost/clanky", "clanky-list"],
    ["/kvizy", "kvizy-list"],
    ["/verejnost", "verejnost-hub"],
  ];
  if (articleSlugs[0]) pages.push([articleSlugs[0], "clanek-detail"]);
  if (quizSlugs[0]) pages.push([quizSlugs[0], "kviz-detail"]);

  for (const [path, label] of pages) {
    console.log(JSON.stringify(await analyzePage(path, label)));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
