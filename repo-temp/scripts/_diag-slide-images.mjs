/** Post-deploy prod proof — slide image HEAD checks */
const PAGES = [
  {
    name: "orientace-v-tele",
    url: "https://medscopeglobal.com/academy/courses/anatomie-zaklady-uchazece/lessons/orientace-v-tele",
  },
  {
    name: "krevni-obeh",
    url: "https://medscopeglobal.com/academy/courses/fyziologie-zaklady-uchazece/lessons/krevni-obeh",
  },
  {
    name: "zdrava-strava",
    url: "https://medscopeglobal.com/verejnost/osveta/zdrava-strava",
  },
];

async function head(url) {
  const clean = url.replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\+$/, "");
  try {
    const r = await fetch(clean, { method: "HEAD", redirect: "follow" });
    return { url: clean, status: r.status, ok: r.ok };
  } catch (e) {
    return { url: clean, status: 0, ok: false, error: String(e) };
  }
}

const table = [];
for (const page of PAGES) {
  const r = await fetch(page.url);
  const html = await r.text();
  const imgs = [...html.matchAll(/https:\/\/images\.unsplash\.com\/[^"'\s<>\\]+/g)].map((m) => m[0]);
  const unique = [...new Set(imgs.map((u) => u.replace(/&amp;/g, "&")))];
  const checks = await Promise.all(unique.slice(0, 4).map(head));
  const allOk = checks.length > 0 && checks.every((c) => c.ok);
  table.push({ page: page.name, status: r.status, imageCount: unique.length, allImages200: allOk, checks });
}

console.log(JSON.stringify(table, null, 2));
