import { describe, expect, it } from "vitest";
import { filterArticles, filterEvents, getEventBySlug } from "@/lib/content";
describe("content filtering", () => {
  it("returns matching articles and supports empty state", () => { expect(filterArticles({ query: "AI" })).toHaveLength(1); expect(filterArticles({ query: "definitely-not-present" })).toHaveLength(0); });
  it("filters events by region, format and specialization", () => { const results = filterEvents({ region: "Česko", format: "hybrid", specialization: "Digitální zdraví" }); expect(results).toHaveLength(1); expect(results[0]?.slug).toBe("digital-health-prague-2026"); });
  it("loads approved event detail by slug", () => { expect(getEventBySlug("digital-health-prague-2026")?.title).toContain("Digital Health"); });
});
