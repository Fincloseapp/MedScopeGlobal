const r = await fetch("https://medscopeglobal.com/verejnost/clanky", {
  headers: { "User-Agent": "MedScope-verify" },
});
const t = await r.text();
const checks = {
  status: r.status,
  skryt: t.includes("Skrýt článek"),
  klik: t.includes("Klikněte pro celý"),
  ariaExpanded: t.includes("aria-expanded"),
  v25: t.includes("MedScopeGlobal v25"),
  unsplash: (t.match(/images\.unsplash\.com/g) || []).length,
  supabaseV25: (t.match(/supabase\.co\/storage.*v25-images/g) || []).length,
  renderApi: (t.match(/api\/v25\/images\/render/g) || []).length,
};
const imgSrcs = [...t.matchAll(/src="([^"]+)"/g)].slice(0, 12).map((m) => m[1]);
console.log(JSON.stringify({ checks, sampleImgs: imgSrcs }, null, 2));
