import { readFileSync, writeFileSync } from "node:fs";
import {
  isEnglishDominant,
  looksLikeTemplateCzechExcerpt,
} from "../lib/v21/enrich.ts";
import { polishCzechFields, stripRssArtifacts } from "../lib/v22/translate.ts";

const slug =
  "verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu";

function extractArticleProse(html: string) {
  const match = html.match(
    /<div class="article-prose[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<(?:div|section|footer|aside)/i
  );
  return match?.[1] ?? "";
}

async function main() {
  const enHtml = await (
    await fetch(`https://medscopeglobal.com/article/${slug}`)
  ).text();
  const prose = extractArticleProse(enHtml);
  const bodyOnly = prose
    .replace(/<h2[^>]*>Support the author[\s\S]*$/i, "")
    .replace(/<h2[^>]*>Podpořit autora[\s\S]*$/i, "");
  writeFileSync("/tmp/en-body-only.html", bodyOnly);

  const plain = stripRssArtifacts(bodyOnly);
  console.log(
    JSON.stringify(
      {
        words: plain.split(/\s+/).filter(Boolean).length,
        isEnglishDominant: isEnglishDominant(plain),
        looksLikeTemplate: looksLikeTemplateCzechExcerpt(plain.slice(0, 400)),
        cdata: /\]\]>|<!\[CDATA\[/i.test(bodyOnly),
        plainLen: plain.length,
      },
      null,
      2
    )
  );

  const polished = polishCzechFields(
    {
      title:
        "Středomořský talíř na českém stole: Jak si dopřát zdraví bez nutnosti opustit domov",
      excerpt: "Zahradní slavnost na talíři",
      content: bodyOnly,
    },
    "cs"
  );
  const pw = String(polished.content ?? "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  console.log(
    JSON.stringify(
      {
        after_polish_words: pw,
        start: String(polished.content)
          .replace(/<[^>]+>/g, " ")
          .slice(0, 320),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
