import { describe, expect, it } from "vitest";
import { registerSchema, articleInputSchema, generateArticleSchema, ratingSchema } from "@/lib/portal/validation";

describe("portal validation", () => {
  it("rejects weak passwords and invalid emails", () => {
    expect(registerSchema.safeParse({ email: "bad", password: "123", name: "A", role: "reader" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "good@example.com", password: "12345678", name: "Jan Novák", role: "reader" }).success).toBe(true);
  });

  it("requires citations in articles", () => {
    const result = articleInputSchema.safeParse({
      title: "Valid title here",
      summary: "Valid summary with enough characters for validation.",
      sections: [{ id: "1", heading: "Úvod", content: "Content" }],
      clinicalSignificance: "Klinický význam s dostatečnou délkou textu.",
      practiceRecommendations: "Doporučení pro praxi s dostatečnou délkou textu.",
      citations: [],
      tags: [],
      icdCodes: [],
      specialization: "Kardiologie"
    });
    expect(result.success).toBe(false);
  });

  it("validates generate input and rating bounds", () => {
    expect(generateArticleSchema.safeParse({ topic: "ABC", specialization: "Kardiologie" }).success).toBe(true);
    expect(ratingSchema.safeParse({ score: 0 }).success).toBe(false);
    expect(ratingSchema.safeParse({ score: 5 }).success).toBe(true);
  });
});
