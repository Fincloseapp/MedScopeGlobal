async function verifyPage(path) {
  const r = await fetch(`https://medscopeglobal.com${path}`, {
    headers: { "User-Agent": "medscope-verify/1.0" },
  });
  const html = await r.text();
  const hasLfOsu = html.includes("https://lf.osu.cz/");
  const hasOldOsu = html.includes("https://www.osu.cz/lf") || html.includes("https://www.lf.osu.cz");
  const osuLinks = [...html.matchAll(/href="([^"]*osu[^"]*)"/gi)].map((m) => m[1]);
  console.log(`PAGE ${path} status=${r.status} has_lf_osu_cz=${hasLfOsu} has_old=${hasOldOsu}`);
  console.log(`PAGE ${path} osu_links=${JSON.stringify([...new Set(osuLinks)])}`);
  return { hasLfOsu, hasOldOsu };
}

const prijimacky = await verifyPage("/studium/prijimacky");
const univerzity = await verifyPage("/studium/univerzity");
const detail = await verifyPage("/studium/univerzity/lf-os");
console.log("SUMMARY", JSON.stringify({ prijimacky, univerzity, detail }));
