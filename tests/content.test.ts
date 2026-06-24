import { describe, expect, it } from "vitest";
import { articles, dailyArticleTarget, specializations } from "@/lib/data";
import { filterArticles, filterEvents, getEventBySlug } from "@/lib/content";
describe("content filtering", () => {
  it("returns matching articles and supports empty state", () => { expect(filterArticles({ query: "AI" }).length).toBeGreaterThan(0); expect(filterArticles({ query: "definitely-not-present" })).toHaveLength(0); });
  it("publishes 100 daily source-monitoring articles with at least 15 per category", () => { expect(articles.filter((article) => article.id.startsWith("daily-"))).toHaveLength(dailyArticleTarget); for (const specialization of specializations) expect(filterArticles({ specialization }).length).toBeGreaterThanOrEqual(15); });
  it("combines layperson and student into one audience filter", () => { const results = filterArticles({ audience: "laik-student" }); expect(results.length).toBeGreaterThan(0); expect(results.every((article) => article.audience === "laik-student")).toBe(true); });
  it("filters events by region, format and specialization", () => { const results = filterEvents({ region: "Česko", format: "hybrid", specialization: "Digitální zdraví" }); expect(results).toHaveLength(1); expect(results[0]?.slug).toBe("digital-health-prague-2026"); });
  it("loads approved event detail by slug", () => { expect(getEventBySlug("digital-health-prague-2026")?.title).toContain("Digital Health"); });
});
