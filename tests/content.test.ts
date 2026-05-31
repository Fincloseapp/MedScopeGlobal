import { describe, expect, it } from "vitest";
import { articles, dailyArticleTarget, specializations } from "@/lib/data";
import { filterArticles, filterEvents, getEventBySlug } from "@/lib/content";

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

const requiredHeadings = [
  "Úvod",
  "Co téma znamená",
  "Jak funguje v praxi",
  "Klíčové myšlenky ze zdroje",
  "Hlavní přínosy",
  "Rizika a omezení",
  "Příklady použití",
  "Dopad na zdravotnictví / systém / pacienty",
  "Shrnutí"
];

function h2Headings(value: string) {
  return value
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace(/^##\s+/, "").trim());
}

function sectionText(value: string, heading: string) {
  const pattern = new RegExp(`## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n([\\s\\S]*?)(?=\\n## |$)`);
  return value.match(pattern)?.[1] ?? "";
}

function paragraphsInSection(value: string, heading: string) {
  return sectionText(value, heading)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("- "));
}

function sentenceCount(value: string) {
  return value.split(/(?<=[.!?])\s+/).filter(Boolean).length;
}

describe("content filtering", () => {
  it("returns matching articles and supports empty state", () => { expect(filterArticles({ query: "AI" }).length).toBeGreaterThan(0); expect(filterArticles({ query: "definitely-not-present" })).toHaveLength(0); });
  it("publishes 100 daily source-monitoring articles with at least 15 per category", () => { expect(articles.filter((article) => article.id.startsWith("daily-"))).toHaveLength(dailyArticleTarget); for (const specialization of specializations) expect(filterArticles({ specialization }).length).toBeGreaterThanOrEqual(15); });
  it("combines layperson and student into one audience filter", () => { const results = filterArticles({ audience: "laik-student" }); expect(results.length).toBeGreaterThan(0); expect(results.every((article) => article.audience === "laik-student")).toBe(true); });
  it("generates extended educational source excerpts for public/student monitoring articles", () => {
    const publicArticles = articles.filter((article) => article.id.startsWith("daily-") && article.audience === "laik-student").slice(0, 3);
    expect(publicArticles).toHaveLength(3);
    for (const article of publicArticles) {
      expect(wordCount(article.content)).toBeGreaterThanOrEqual(3500);
      expect(h2Headings(article.content)).toEqual(requiredHeadings);
      for (const heading of requiredHeadings) {
        const paragraphs = paragraphsInSection(article.content, heading);
        expect(paragraphs.length).toBeGreaterThanOrEqual(6);
        expect(paragraphs.every((paragraph) => sentenceCount(paragraph) >= 9)).toBe(true);
      }
      for (const heading of ["Hlavní přínosy", "Rizika a omezení", "Příklady použití"]) {
        expect(sectionText(article.content, heading).split("\n").filter((line) => line.startsWith("- ")).length).toBeGreaterThanOrEqual(3);
      }
      expect(article.readingTime).toBeGreaterThanOrEqual(10);
      expect(article.summary).toContain("Rozšířený");
      expect(article.sourceUrl).toMatch(/^https?:\/\//);
    }
  });
  it("filters events by region, format and specialization", () => { const results = filterEvents({ region: "Česko", format: "hybrid", specialization: "Digitální zdraví" }); expect(results).toHaveLength(1); expect(results[0]?.slug).toBe("digital-health-prague-2026"); });
  it("loads approved event detail by slug", () => { expect(getEventBySlug("digital-health-prague-2026")?.title).toContain("Digital Health"); });
});
