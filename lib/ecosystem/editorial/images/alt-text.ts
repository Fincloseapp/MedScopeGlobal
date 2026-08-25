/** Hero image alt text for article pages — CS primary, EN fallback */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import type { ArticleForImageMatch } from "./types";
import { buildAltText } from "./prompts";
import { inferArticleTopic } from "./matcher";

type ArticleAltInput = Pick<
  ArticleForImageMatch,
  "title" | "excerpt" | "metadata"
> & { content?: string | null };

export function getArticleHeroAltText(
  article: ArticleAltInput,
  locale: GlobalLocaleCode = "cs"
): string {
  const meta = article.metadata ?? {};
  const cs = typeof meta.hero_alt_text_cs === "string" ? meta.hero_alt_text_cs : null;
  const en = typeof meta.hero_alt_text_en === "string" ? meta.hero_alt_text_en : null;

  if (locale === "cs" || locale === "sk") {
    if (cs?.trim()) return cs.trim();
    if (en?.trim()) return en.trim();
  } else {
    if (en?.trim()) return en.trim();
    if (cs?.trim()) return cs.trim();
  }

  const topic =
    typeof meta.editorial_image_topic === "string"
      ? (meta.editorial_image_topic as "longevity" | "lifestyle" | "seniors" | "trending")
      : inferArticleTopic({
          id: "",
          slug: "",
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
        });

  const built = buildAltText(
    { id: "", slug: "", title: article.title, excerpt: article.excerpt },
    topic
  );
  return locale === "cs" || locale === "sk" ? built.cs : built.en;
}
