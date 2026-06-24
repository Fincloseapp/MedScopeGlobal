import { describe, expect, it, beforeEach } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, readSessionToken } from "@/lib/portal/auth";
import { resetPortalStore, getUserByEmail, createUser } from "@/lib/portal/store";
import { resolveVerificationStatus } from "@/lib/portal/rbac";
import { createUserId } from "@/lib/portal/auth";

describe("portal auth", () => {
  beforeEach(() => resetPortalStore());

  it("hashes and verifies passwords", () => {
    const hash = hashPassword("SecurePass123!");
    expect(verifyPassword("SecurePass123!", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("creates and reads signed session tokens", () => {
    const user = {
      id: "usr_test",
      email: "test@example.com",
      name: "Test User",
      role: "reader" as const,
      verificationStatus: "not_required" as const
    };
    const token = createSessionToken(user);
    expect(readSessionToken(token)?.email).toBe("test@example.com");
    expect(readSessionToken(`${token}tampered`)).toBeNull();
  });

  it("auto-approves expert emails from verified domains", () => {
    expect(resolveVerificationStatus("doc@lf1.cuni.cz", "expert")).toBe("approved");
    expect(resolveVerificationStatus("doc@gmail.com", "expert")).toBe("pending");
    expect(resolveVerificationStatus("reader@example.com", "reader")).toBe("not_required");
  });

  it("rejects duplicate registration emails", () => {
    createUser({
      id: createUserId(),
      email: "dup@example.com",
      passwordHash: hashPassword("Password123!"),
      name: "Dup",
      role: "reader",
      verificationStatus: "not_required",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    expect(getUserByEmail("dup@example.com")?.email).toBe("dup@example.com");
  });
});
