async function verify() {
  const r = await fetch("https://medscopeglobal.com/studium/prijimacky", {
    headers: { "User-Agent": "medscope-verify/1.0" }
  });
  const html = await r.text();
  console.log("status", r.status);
  const hasLfOsu = html.includes("https://lf.osu.cz/");
  const hasOldOsu = html.includes("https://www.osu.cz/lf") || html.includes("osu.cz/lf");
  console.log("has_lf_osu_cz", hasLfOsu);
  console.log("has_old_osu_cz", hasOldOsu);
  const idx = html.indexOf("LF OU");
  if (idx >= 0) {
    console.log("context", html.slice(idx, idx + 400).replace(/\s+/g, " "));
  }
  const links = [...html.matchAll(/href=\"([^\"]*osu[^\"]*)\"/gi)].map(m => m[1]);
  console.log("osu_links", JSON.stringify(links));
}
verify();
