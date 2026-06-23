const res = await fetch("https://medscopeglobal.com/");
const t = await res.text();
const needle = "photo-1576091160550";
const idx = t.indexOf(needle);
if (idx < 0) { console.log("NOT FOUND"); process.exit(0); }
console.log("FOUND at", idx);
console.log(t.slice(Math.max(0, idx - 250), idx + 250));
const matches = [...t.matchAll(/https?:[^"'\s>]*photo-1576091160550[^"'\s>]*/g)];
console.log("url count", matches.length);
matches.forEach((m) => console.log(m[0]));
