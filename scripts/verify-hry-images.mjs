const urls = [
  "https://medscopeglobal.com/medicina/hry/anatomie-systemy",
  "https://medscopeglobal.com/medicina/hry",
  "https://medscopeglobal.com/medicina/hry/fyziologie-homeostaza",
  "https://medscopeglobal.com/kvizy/farmakologie-antihypertenziva",
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

for (const url of urls) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((s) => !/logo|icon|favicon/i.test(s));
  const broken = imgs.filter((s) => s.includes("9c0d0b0b0b0b") || s.includes("unsplash"));
  console.log(JSON.stringify({ url, status: res.status, imgCount: imgs.length, imgs: imgs.slice(0, 2), brokenLegacy: broken.length > 0 }));
}
