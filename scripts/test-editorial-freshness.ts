#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  buildResurfaceMetadata,
  formatArticleDateLabel,
  isResurfaceCandidate,
  mixFreshFeed,
  passesResurfaceQuality,
  readEditorialResurface,
  selectResurfaceCandidates,
  type FreshnessArticle,
} from "../lib/editorial/freshness";

const NOW = new Date("2026-08-19T10:00:00.000Z");

function article(partial: Partial<FreshnessArticle>): FreshnessArticle {
  return {
    id: partial.id ?? "id",
    slug: partial.slug ?? "slug",
    title: partial.title ?? "Český článek o prevenci",
    excerpt: partial.excerpt ?? "Srozumitelný český perex o zdraví.",
    content: partial.content ?? `<p>${"Doložený český odstavec o prevenci a limitech. ".repeat(120)}</p>
<h2>Limity a nejistoty</h2><p>Text je redakční syntéza, nikoli klinické doporučení.</p>
<h2>Dopad do klinické praxe</h2><p>Postup se nemění bez primárního zdroje.</p>
<h2>Zdroje</h2><ul><li>PubMed</li></ul>`,
    published_at: partial.published_at ?? "2026-07-01T00:00:00.000Z",
    created_at: partial.created_at ?? "2026-07-01T00:00:00.000Z",
    updated_at:
      partial.updated_at ??
      partial.published_at ??
      "2026-07-01T00:00:00.000Z",
    source_url: partial.source_url ?? "https://pubmed.ncbi.nlm.nih.gov/123",
    source_name: partial.source_name ?? "PubMed",
    locale: "cs",
    metadata: partial.metadata ?? {},
    ...partial,
  };
}

const mixed = mixFreshFeed(
  [{ id: "n1" }, { id: "n2" }, { id: "n3" }, { id: "n4" }],
  [{ id: "o1" }, { id: "n2" }, { id: "o2" }],
  6
);
assert.deepEqual(
  mixed.map((item) => item.id),
  ["n1", "n2", "o1", "n3", "n4", "o2"]
);

const cardio = article({
  id: "cardio",
  title: "Hypertenze a cholesterol v létě",
  published_at: "2026-06-20T00:00:00.000Z",
});
assert.equal(isResurfaceCandidate(cardio, NOW), true);
assert.equal(passesResurfaceQuality(cardio, NOW), true);

const thin = article({
  id: "thin",
  title: "Hypertenze",
  content: "<p>Krátký text.</p>",
});
assert.equal(passesResurfaceQuality(thin, NOW), false);

const quarantined = article({
  id: "q",
  title: "Diabetes a metabolismus",
  metadata: { editorial_quarantine: { batch_id: "x" } },
});
assert.equal(isResurfaceCandidate(quarantined, NOW), false);

const tooNew = article({
  id: "new",
  title: "Diabetes 2. typu",
  published_at: "2026-08-15T00:00:00.000Z",
});
assert.equal(isResurfaceCandidate(tooNew, NOW), false);

const selected = selectResurfaceCandidates(
  [cardio, thin, quarantined, tooNew],
  3,
  NOW
);
assert.deepEqual(
  selected.map((item) => item.id),
  ["cardio"]
);

const built = buildResurfaceMetadata(cardio, NOW);
assert.ok(built);
assert.equal(built?.theme.id, "cardio");
const resurface = readEditorialResurface(built?.metadata);
assert.equal(resurface?.original_published_at, "2026-06-20T00:00:00.000Z");
assert.equal(resurface?.reason, "seasonal_topic_match");

const publishedLabel = formatArticleDateLabel(cardio, "cs-CZ");
assert.equal(publishedLabel?.kind, "published");

const updatedLabel = formatArticleDateLabel(
  {
    ...cardio,
    metadata: built?.metadata,
    updated_at: NOW.toISOString(),
  },
  "cs-CZ"
);
assert.equal(updatedLabel?.kind, "updated");
assert.match(updatedLabel?.text ?? "", /Aktualizováno/);

console.log("test-editorial-freshness: ok");
