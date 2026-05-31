import { describe, expect, it } from "vitest";
import { articles, dailyArticleTarget, specializations } from "@/lib/data";
import { filterArticles, filterEvents, getEventBySlug } from "@/lib/content";

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

describe("content filtering", () => {
  it("returns matching articles and supports empty state", () => { expect(filterArticles({ query: "AI" }).length).toBeGreaterThan(0); expect(filterArticles({ query: "definitely-not-present" })).toHaveLength(0); });
  it("publishes 100 daily source-monitoring articles with at least 15 per category", () => { expect(articles.filter((article) => article.id.startsWith("daily-"))).toHaveLength(dailyArticleTarget); for (const specialization of specializations) expect(filterArticles({ specialization }).length).toBeGreaterThanOrEqual(15); });
  it("combines layperson and student into one audience filter", () => { const results = filterArticles({ audience: "laik-student" }); expect(results.length).toBeGreaterThan(0); expect(results.every((article) => article.audience === "laik-student")).toBe(true); });
  it("generates extended educational source excerpts for public/student monitoring articles", () => {
    const publicArticles = articles.filter((article) => article.id.startsWith("daily-") && article.audience === "laik-student").slice(0, 3);
    expect(publicArticles).toHaveLength(3);
    for (const article of publicArticles) {
      expect(wordCount(article.content)).toBeGreaterThanOrEqual(800);
      expect(wordCount(article.content)).toBeLessThanOrEqual(1200);
      expect(article.content).toContain("## Úvod");
      expect(article.content).toContain("## Co téma znamená");
      expect(article.content).toContain("## Jak funguje v praxi");
      expect(article.content).toContain("## Hlavní přínosy");
      expect(article.content).toContain("## Rizika a omezení");
      expect(article.content).toContain("## Příklady použití");
      expect(article.content).toContain("## Dopad na zdravotnictví");
      expect(article.content).toContain("## Shrnutí");
    }
  });
  it("filters events by region, format and specialization", () => { const results = filterEvents({ region: "Česko", format: "hybrid", specialization: "Digitální zdraví" }); expect(results).toHaveLength(1); expect(results[0]?.slug).toBe("digital-health-prague-2026"); });
  it("loads approved event detail by slug", () => { expect(getEventBySlug("digital-health-prague-2026")?.title).toContain("Digital Health"); });
});
