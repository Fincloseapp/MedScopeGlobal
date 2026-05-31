import { describe, expect, it, beforeEach } from "vitest";
import { generateArticle } from "@/lib/portal/article-generator";
import {
  resetPortalStore,
  listArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleBySlugFromStore,
  rateArticle,
  saveArticle,
  getRelatedArticles,
  getUserByEmail
} from "@/lib/portal/store";
import { createArticleId } from "@/lib/portal/auth";

describe("portal articles", () => {
  beforeEach(() => resetPortalStore());

  it("generates structured article with required sections and citations", () => {
    const generated = generateArticle(
      { topic: "Test téma", keywords: ["test"], specialization: "Kardiologie" },
      "author-1",
      "Autor Test"
    );
    expect(generated.sections.length).toBeGreaterThanOrEqual(4);
    expect(generated.sections.map((section) => section.heading)).toEqual(
      expect.arrayContaining([
        "Úvod",
        "Co téma znamená",
        "Jak funguje v praxi",
        "Hlavní přínosy",
        "Rizika a omezení",
        "Příklady použití",
        "Dopad na systém a pacienty",
        "Shrnutí"
      ])
    );
    expect(generated.sections.every((section) => section.content.split(/\s+/).length >= 60)).toBe(true);
    expect(generated.clinicalSignificance.length).toBeGreaterThan(10);
    expect(generated.practiceRecommendations.length).toBeGreaterThan(10);
    expect(generated.citations.length).toBeGreaterThanOrEqual(3);
    expect(generated.citations.every((c) => c.sourceName && c.title)).toBe(true);
  });

  it("filters published articles for anonymous users", () => {
    const drafts = listArticles({ status: "draft" }, undefined, undefined);
    expect(drafts.length).toBe(0);
    const published = listArticles({}, undefined, undefined);
    expect(published.every((a) => a.status === "published")).toBe(true);
  });

  it("supports fulltext search and specialization filter", () => {
    const cardio = listArticles({ query: "kardio", specialization: "Kardiologie" });
    expect(cardio.length).toBeGreaterThan(0);
    expect(cardio.every((a) => a.specialization === "Kardiologie")).toBe(true);
  });

  it("handles publish workflow and slug lookup", () => {
    const generated = generateArticle(
      { topic: "Workflow test", keywords: [], specialization: "Neurologie" },
      getUserByEmail("expert@lf1.cuni.cz")!.id,
      "Expert"
    );
    const draft = createArticle({ ...generated, ratingSum: 0, ratingCount: 0 });
    const published = updateArticle(draft.id, { status: "published", publishedAt: new Date().toISOString() });
    expect(getArticleBySlugFromStore(published.slug)?.status).toBe("published");
  });

  it("supports rating and saving", () => {
    const published = listArticles({ status: "published" })[0];
    const reader = getUserByEmail("reader@example.com")!;
    const rated = rateArticle(reader.id, published.id, 5);
    expect(rated.ratingCount).toBeGreaterThan(0);
    saveArticle(reader.id, published.id);
    expect(getRelatedArticles(published).every((a) => a.id !== published.id)).toBe(true);
  });

  it("deletes articles without dead references", () => {
    const article = createArticle({
      id: createArticleId(),
      slug: "delete-me",
      title: "Delete test",
      summary: "Test summary long enough for validation rules here.",
      sections: [{ id: "s1", heading: "Úvod", content: "Obsah článku pro test mazání." }],
      clinicalSignificance: "Klinický význam testovacího článku pro QA.",
      practiceRecommendations: "Doporučení pro praxi testovacího článku pro QA.",
      citations: [{ id: "c1", title: "Citace", sourceName: "SÚKL", sourceUrl: "https://www.sukl.cz" }],
      tags: ["test"],
      icdCodes: ["Z00"],
      specialization: "Interní medicína",
      status: "draft",
      authorId: "author",
      authorName: "Author",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: 5,
      ratingSum: 0,
      ratingCount: 0
    });
    deleteArticle(article.id);
    expect(listArticles({ query: "Delete test" }, undefined, "admin").find((a) => a.id === article.id)).toBeUndefined();
  });

  it("returns empty list for non-matching search", () => {
    expect(listArticles({ query: "xyznonexistentquery123" }).length).toBe(0);
  });
});
