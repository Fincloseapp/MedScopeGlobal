async function check(url, label) {
  const r = await fetch(url, { headers: { "User-Agent": "coord-audit/1" } });
  const html = await r.text();
  const lf = html.includes("https://lf.osu.cz/");
  const old = html.includes("osu.cz/lf") || html.includes("www.osu.cz/lf");
  console.log(label, "status", r.status, "lf.osu.cz", lf, "old_osu", old);
}
await check("https://medscopeglobal.com/studium/prijimacky", "prijimacky");
await check("https://medscopeglobal.com/studium/univerzity", "univerzity");
await check("https://medscopeglobal.com/", "homepage");
