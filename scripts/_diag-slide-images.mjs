/** Diagnose slide image URLs on prod pages */
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
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { url, status: r.status, ok: r.ok };
  } catch (e) {
    return { url, status: 0, ok: false, error: String(e) };
  }
}

for (const page of PAGES) {
  const r = await fetch(page.url);
  const html = await r.text();
  const imgs = [...html.matchAll(/https:\/\/images\.unsplash\.com\/[^"'\s<>]+/g)].map((m) => m[0]);
  const unique = [...new Set(imgs)];
  console.log(`\n=== ${page.name} (${r.status}) ===`);
  console.log("unsplash in HTML:", unique.length);
  for (const u of unique.slice(0, 6)) {
    console.log(await head(u));
  }
  // CSP header
  const csp = r.headers.get("content-security-policy");
  if (csp) console.log("CSP img-src snippet:", csp.match(/img-src[^;]+/)?.[0]);
}

// HEAD all curated URLs from slide-images map
const curated = [
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  "https://images.unsplash.com/photo-1532187863486-abf9db1a4690?w=800&q=80",
  "https://images.unsplash.com/photo-1628348068343-c6a848d2a385?w=800&q=80",
  "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
];
console.log("\n=== Curated URL HEAD checks ===");
for (const u of curated) {
  console.log(await head(u));
}
