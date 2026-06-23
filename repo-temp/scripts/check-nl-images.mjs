const t = await fetch("https://www.medscopeglobal.com/newsletter/posledni", { cache: "no-store" }).then((r) => r.text());
for (const id of ["legislativa", "leky", "univerzity"]) {
  const marker = `id="nl-${id}"`;
  const i = t.indexOf(marker);
  const chunk = i >= 0 ? t.slice(i, i + 3000) : "";
  const sectionImg = chunk.includes("_next/image") && chunk.includes("photo-");
  const itemImg = (chunk.match(/sizes="140px"/g) || []).length;
  console.log(id, { found: i >= 0, sectionImg, itemThumbs: itemImg });
}
console.log("title in page", t.includes("MedScopeGlobal Newsletter"));
