async function check(url, label) {
  const r = await fetch(url, {
    headers: { "User-Agent": "medscope-audit/1.0", "Cache-Control": "no-cache" },
  });
  const h = await r.text();
  const lf = h.includes("https://lf.osu.cz/") || h.includes("https://www.lf.osu.cz/");
  const old = h.includes("https://www.osu.cz/lf") || h.includes("osu.cz/lf");
  const links = [...h.matchAll(/href="([^"]*osu[^"]*)"/gi)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 10);
  console.log(label, "status", r.status, "lf_ok", lf, "old_osu", old, "links", JSON.stringify(links));
}

(async () => {
  await check("https://medscopeglobal.com/studium/prijimacky", "prijimacky");
  await check("https://medscopeglobal.com/studium/univerzity", "univerzity");
  await check("https://medscopeglobal.com/studium/univerzity/lf-os", "univerzity-lf-os");
  await check("https://medscopeglobal.com/studenti/chci-studovat", "chci-studovat");
})();
