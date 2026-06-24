import { describe, expect, it } from "vitest";
import { hasPermission, canReadArticle, canEditArticle, isVerifiedExpert } from "@/lib/portal/rbac";
import type { SessionUser } from "@/lib/portal/types";

const reader: SessionUser = { id: "r1", email: "r@x.com", name: "Reader", role: "reader", verificationStatus: "not_required" };
const pendingExpert: SessionUser = { id: "e1", email: "e@x.com", name: "Expert", role: "expert", verificationStatus: "pending" };
const expert: SessionUser = { id: "e2", email: "e@lf1.cuni.cz", name: "Expert", role: "expert", verificationStatus: "approved" };
const admin: SessionUser = { id: "a1", email: "a@x.com", name: "Admin", role: "admin", verificationStatus: "approved" };

describe("portal RBAC", () => {
  it("allows readers to read, save and rate", () => {
    expect(hasPermission(reader, "articles:read")).toBe(true);
    expect(hasPermission(reader, "articles:save")).toBe(true);
    expect(hasPermission(reader, "articles:rate")).toBe(true);
    expect(hasPermission(reader, "articles:create")).toBe(false);
  });

  it("blocks unverified experts from publishing", () => {
    expect(isVerifiedExpert(pendingExpert)).toBe(false);
    expect(hasPermission(pendingExpert, "articles:publish")).toBe(false);
    expect(hasPermission(expert, "articles:publish")).toBe(true);
  });

  it("restricts draft visibility", () => {
    expect(canReadArticle("published", null)).toBe(true);
    expect(canReadArticle("draft", null)).toBe(false);
    expect(canReadArticle("draft", expert)).toBe(true);
    expect(canReadArticle("draft", reader)).toBe(false);
  });

  it("allows admin to edit any article", () => {
    expect(canEditArticle("other-author", admin)).toBe(true);
    expect(canEditArticle("other-author", expert)).toBe(false);
    expect(canEditArticle(expert.id, expert)).toBe(true);
  });

  it("restricts admin verification to admin role", () => {
    expect(hasPermission(admin, "admin:verify-experts")).toBe(true);
    expect(hasPermission(expert, "admin:verify-experts")).toBe(false);
  });
});
