import assert from "node:assert/strict";
import {
  isPlaceholderUniversityNewsTitle,
  isThinMagazineTitle,
} from "../../lib/articles/quality-filters";
import { resolveVerejnostCoverUrl } from "../../lib/verejnost/resolve-cover";

assert.equal(isThinMagazineTitle("Zdraví na dosah: Praktické rady pro každého"), true);
assert.equal(isThinMagazineTitle("Zdravý život: 10 praktických rad pro každého"), true);
assert.equal(isThinMagazineTitle("Epidemiologická zpráva: Epidemie a CDC"), true);
assert.equal(
  isThinMagazineTitle("Chřipka versus nachlazení – jak je rozlišit: praktický přehled pro rodiny"),
  false
);

assert.equal(isPlaceholderUniversityNewsTitle("1. LF UK"), true);
assert.equal(isPlaceholderUniversityNewsTitle("1. LF UK — výzkumná novinka"), true);
assert.equal(isPlaceholderUniversityNewsTitle("1. LF UK - Výzkumné objevy"), true);
assert.equal(isPlaceholderUniversityNewsTitle("Nový objev v léčbě roztroušené sklerózy"), true);
assert.equal(
  isPlaceholderUniversityNewsTitle("Nové centrum pro výzkum a vývoj léčiv na Lékařské fakultě MU"),
  false
);

const sleepCover = resolveVerejnostCoverUrl({
  slug: "verejnost-zivotni-styl-spanek",
  title: "Zdravý spánek před začátkem školního roku",
});
assert.match(sleepCover, /photo-1631049307264/);

const waterCover = resolveVerejnostCoverUrl({
  slug: "verejnost-zivotni-styl-hydratace",
  title: "Mýty o pitném režimu: Jak zůstat hydratovaný",
});
assert.match(waterCover, /photo-1548839140/);

const stressCover = resolveVerejnostCoverUrl({
  slug: "stres-prace",
  title: "Jak se vyrovnat se stresem z práce: dechová cvičení",
});
assert.match(stressCover, /photo-1441974231531/);

const campusCover = resolveVerejnostCoverUrl({
  slug: "lf-mu-centrum-leciv",
  title: "Nové centrum pro výzkum a vývoj léčiv na Lékařské fakultě MU",
});
assert.match(campusCover, /photo-1523050854058/);

console.log("magazine-quality-check ok");
