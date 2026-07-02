const r = await fetch("https://www.medscopeglobal.com/newsletter/posledni", { cache: "no-store" });
const t = await r.text();
console.log("status", r.status);
console.log("has sections json", t.includes('"sections"'));
console.log("has layout_json", t.includes("layout_json"));
console.log("has nl-section", t.includes("nl-section"));
console.log("has v23-newsletter", t.includes("v23-newsletter"));
const idx = t.indexOf("{");
if (idx > 0) console.log("first brace context:", t.slice(Math.max(0, idx - 50), idx + 200));
