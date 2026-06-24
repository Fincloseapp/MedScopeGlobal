import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getDatabaseConfigurationIssue,
  getDatabaseEnvSource,
  getResolvedDatabaseUrls,
  hasDatabaseEnvConfigured,
  resolveRuntimeConnectionString
} from "@/lib/database-env";

const originalEnv = process.env;

describe("database-env", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.DATABASE_URL;
    delete process.env.DIRECT_URL;
    delete process.env.POSTGRES_URL;
    delete process.env.POSTGRES_PRISMA_URL;
    delete process.env.POSTGRES_URL_NON_POOLING;
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_DATABASE;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("prefers Vercel Supabase integration vars over legacy placeholders", () => {
    process.env.DATABASE_URL = "postgresql://postgres.xcydgqnivxfhprbmdyym:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    process.env.DIRECT_URL = "postgresql://postgres:[PASSWORD]@db.xcydgqnivxfhprbmdyym.supabase.co:5432/postgres";
    process.env.POSTGRES_URL = "postgresql://postgres.xcydgqnivxfhprbmdyym:real-secret@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    process.env.POSTGRES_URL_NON_POOLING = "postgresql://postgres:real-secret@db.xcydgqnivxfhprbmdyym.supabase.co:5432/postgres";

    expect(getDatabaseEnvSource()).toBe("integration");
    expect(getDatabaseConfigurationIssue()).toBeNull();
    expect(getResolvedDatabaseUrls()).toEqual({
      pooled: process.env.POSTGRES_URL,
      direct: process.env.POSTGRES_URL_NON_POOLING
    });
    expect(resolveRuntimeConnectionString()).toBe(process.env.POSTGRES_URL);
    expect(hasDatabaseEnvConfigured()).toBe(true);
  });

  it("reports invalid legacy placeholders when integration vars are missing", () => {
    process.env.DATABASE_URL = "postgresql://postgres:[PASSWORD]@db.example.supabase.co:5432/postgres";

    expect(getDatabaseConfigurationIssue()).toContain("[PASSWORD]");
    expect(hasDatabaseEnvConfigured()).toBe(false);
  });
});
