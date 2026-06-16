const urls = [
  ["prijimacky", "https://medscopeglobal.com/studium/prijimacky"],
  ["univerzity", "https://medscopeglobal.com/studium/univerzity"],
];
for (const [label, url] of urls) {
  const r = await fetch(url, { headers: { "User-Agent": "coord-audit/1" } });
  const html = await r.text();
  console.log(label, r.status, "lf.osu.cz", html.includes("https://lf.osu.cz/"), "old", html.includes("osu.cz/lf"));
}
