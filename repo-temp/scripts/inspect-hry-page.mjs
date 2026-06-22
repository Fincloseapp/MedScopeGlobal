const url = "https://medscopeglobal.com/medicina/hry/anatomie-systemy";
const r = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0", "Cache-Control": "no-cache" },
});
const t = await r.text();
console.log("status", r.status);
console.log("unsplash", t.includes("unsplash"));
const bare = (t.match(/\/v25\/images\/render/g) || []).length;
const api = (t.match(/\/api\/v25\/images\/render/g) || []).length;
console.log("v25 render api", api > 0);
console.log("wrong bare /v25 path", bare > api);
const imgs = [...t.matchAll(/<img[^>]+>/g)].filter((m) => !m[0].includes("Logo_"));
console.log("non-logo imgs:", imgs.map((m) => m[0].slice(0, 250)).join("\n---\n"));
