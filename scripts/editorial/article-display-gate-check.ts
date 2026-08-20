import assert from "node:assert/strict";
import { isPhysicianRestrictedArticle } from "../../lib/articles/professional-access";
import {
  hasEditorialSetupLeak,
  sanitizeArticleHtml,
  sanitizePublicText,
} from "../../lib/articles/sanitize-display";

assert.equal(
  hasEditorialSetupLeak(
    "Pro plné redakční zpracování nastavte GROQ_API_KEY (zdarma)."
  ),
  true
);

const dirty = `<p>Projekt KOMPAS vstoupil do klíčové fáze.</p>
<aside class="ms-public-ad"><div class="ms-public-ad__label">Doporučený obsah</div></aside>
<p>Tento článek byl automaticky zpracován ze zdroje Ministerstvo zdravotnictví ČR. Pro plné redakční zpracování nastavte <code>GROQ_API_KEY</code> (zdarma).</p>`;

const clean = sanitizeArticleHtml(dirty, {
  title: "KOMPAS",
  excerpt: "Projekt domácí péče v Česku.",
  source_name: "Ministerstvo zdravotnictví ČR",
  source_url: "https://example.com",
});
assert.equal(hasEditorialSetupLeak(clean), false);
assert.doesNotMatch(clean, /GROQ/i);
assert.doesNotMatch(clean, /ms-public-ad/);
assert.match(clean, /KOMPAS|domácí péče|Ministerstvo|Shrnutí/i);

assert.equal(
  sanitizePublicText("Text. Pro plné redakční zpracování nastavte GROQ_API_KEY (zdarma)."),
  "Text."
);

assert.equal(
  isPhysicianRestrictedArticle({
    slug: "kompas-projekt",
    title: "KOMPAS: Projekt, který mění podobu domácí péče v Česku",
    locale: "cs",
    audience: "public",
  }),
  false
);

assert.equal(
  isPhysicianRestrictedArticle({
    slug: "acep-sedation",
    title: "Unscheduled Procedural Sedation Multidisciplinary Delphi Consensus Guidelines",
    locale: "en",
    min_access_level: "public",
  }),
  true
);

assert.equal(
  isPhysicianRestrictedArticle({
    slug: "verejnost-zivotni-styl-hydratace",
    title: "Mýty o pitném režimu",
    public_topic: "zivotni-styl",
  }),
  false
);

console.log("article-display-gate-check ok");
