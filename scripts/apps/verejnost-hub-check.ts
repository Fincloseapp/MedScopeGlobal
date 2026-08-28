#!/usr/bin/env node
/**
 * Premium veřejnost magazine hubs — curated covers, Czech copy, no Tringelt.
 * Run via: pnpm exec tsx scripts/apps/verejnost-hub-check.ts
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isBrainScanCoverUrl } from "../../lib/ecosystem/editorial/images";
import { VEREJNOST_HUB_TOPICS } from "../../lib/config/verejnost-topics";
import {
  getPublicTopicImage,
  VEREJNOST_FALLBACK_COVER,
} from "../../lib/verejnost/images";
import {
  OSVETA_MAGAZINE_HUB,
  TEMATA_MAGAZINE_HUB,
  ROZHOVORY_MAGAZINE_HUB,
  ZEBRICEK_MAGAZINE_HUB,
  VEREJNOST_MAGAZINE_HUB,
  getClankyMagazineHub,
  type MagazineSectionHubConfig,
} from "../../lib/portal/magazine-section-hub";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function hubUrls(hub: MagazineSectionHubConfig): string[] {
  return [hub.heroCoverImage, ...hub.pillars.map((p) => p.coverImage)];
}

function assertHub(hub: MagazineSectionHubConfig) {
  const blob = [
    hub.title,
    hub.heroDeck,
    hub.editorialIntroTitle,
    ...hub.editorialIntro,
    hub.contribution.title,
    hub.contribution.description,
    hub.primaryCta.label,
    ...hub.secondaryCtas.map((c) => c.label),
  ].join(" ");
  assert.ok(!/tringelt/i.test(blob), `${hub.id} copy must not mention Tringelt`);
  assert.ok(hub.editorialIntro.length >= 2, `${hub.id} needs editorial intro`);
  assert.ok(hub.heroDeck.length > 80, `${hub.id} hero deck too thin`);
  for (const url of hubUrls(hub)) {
    assert.ok(url.startsWith("/assets/covers/"), `${hub.id} cover must be curated, got ${url}`);
    assert.ok(!isBrainScanCoverUrl(url), `${hub.id} must not use retired clinical.webp, got ${url}`);
    assert.ok(existsSync(join(root, "public", url.replace(/^\//, ""))), `missing ${url}`);
  }
}

const hubs: MagazineSectionHubConfig[] = [
  VEREJNOST_MAGAZINE_HUB,
  OSVETA_MAGAZINE_HUB,
  TEMATA_MAGAZINE_HUB,
  ROZHOVORY_MAGAZINE_HUB,
  ZEBRICEK_MAGAZINE_HUB,
  getClankyMagazineHub(),
  getClankyMagazineHub("prevence"),
  getClankyMagazineHub("nemoci"),
  getClankyMagazineHub("zivotni-styl"),
  getClankyMagazineHub("dlouhovekost"),
  getClankyMagazineHub("rozhovory"),
];

assert.equal(VEREJNOST_MAGAZINE_HUB.id, "verejnost");
assert.equal(VEREJNOST_MAGAZINE_HUB.primaryCta.href, "/verejnost/temata");
assert.ok(VEREJNOST_MAGAZINE_HUB.pillars.some((p) => p.href === "/verejnost/clanky"));
assert.ok(VEREJNOST_MAGAZINE_HUB.pillars.some((p) => p.href === "/verejnost/osveta"));

for (const hub of hubs) assertHub(hub);

assert.ok(!isBrainScanCoverUrl(VEREJNOST_FALLBACK_COVER), "fallback must not be brain-scan");
for (const topic of VEREJNOST_HUB_TOPICS) {
  const img = getPublicTopicImage(topic.slug);
  assert.ok(img, `topic ${topic.slug} needs cover`);
  assert.ok(img!.startsWith("/assets/covers/"), `${topic.slug} cover ${img}`);
  assert.ok(!isBrainScanCoverUrl(img), `${topic.slug} must not use clinical.webp`);
}

console.log(`✓ veřejnost magazine hubs: ${hubs.length} configs, ${VEREJNOST_HUB_TOPICS.length} topic tiles`);
