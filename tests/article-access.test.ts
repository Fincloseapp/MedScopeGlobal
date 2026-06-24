import { describe, expect, it } from "vitest";
import { createArticleAccessCookieValue, readArticleAccessCookie, resolveArticleAccess } from "@/lib/article-access";
import { articles } from "@/lib/data";

describe("article access", () => {
  const publicArticle = articles.find((article) => article.audience === "laik-student");
  const clinicianArticle = articles.find((article) => article.audience === "clinician");
  const researcherArticle = articles.find((article) => article.audience === "researcher");

  it("keeps public and student articles fully visible to all visitors", () => {
    expect(publicArticle).toBeDefined();
    expect(resolveArticleAccess(publicArticle!, null).hasFullAccess).toBe(true);
  });

  it("shows only a preview for professional articles without newsletter profile", () => {
    expect(clinicianArticle).toBeDefined();
    const access = resolveArticleAccess(clinicianArticle!, null);
    expect(access.hasFullAccess).toBe(false);
    expect(access.requiresSubscription).toBe(true);
  });

  it("unlocks doctor and scientist articles after signed newsletter preference", () => {
    expect(clinicianArticle).toBeDefined();
    expect(researcherArticle).toBeDefined();
    const cookie = createArticleAccessCookieValue({ email: "doctor@example.com", role: "doctor", newsletter: true, preferences: { specialization: "Kardiologie" } });
    const profile = readArticleAccessCookie(cookie);
    expect(profile?.email).toBe("doctor@example.com");
    expect(resolveArticleAccess(clinicianArticle!, profile).hasFullAccess).toBe(true);
    expect(resolveArticleAccess(researcherArticle!, profile).hasFullAccess).toBe(true);
  });

  it("rejects tampered access cookies", () => {
    const cookie = createArticleAccessCookieValue({ email: "doctor@example.com", role: "doctor", newsletter: true, preferences: {} });
    expect(readArticleAccessCookie(`${cookie}tampered`)).toBeNull();
  });
});
