import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

if (process.env.VERCEL === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

function resolveMigrationUrl() {
  return [
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DIRECT_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL
  ].find((value) => value && !/\[(PASSWORD|REF|HESLO)\]/i.test(value));
}

function sanitizeConnectionString(connectionString) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("sslaccept");
    return url.toString();
  } catch {
    return connectionString.replace(/([?&])sslmode=[^&]*(&)?/g, (_, prefix, suffix) => (suffix ? prefix : ""));
  }
}

function normalizeConnectionString(connectionString) {
  return sanitizeConnectionString(connectionString);
}

export function createSeedPrismaClient() {
  const raw = resolveMigrationUrl();
  if (!raw) return new PrismaClient();

  const connectionString = normalizeConnectionString(raw);
  const useSsl = process.env.VERCEL === "1" || connectionString.includes("supabase");
  const pool = new Pool({
    connectionString,
    max: 1,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
  });

  return new PrismaClient({ adapter: new PrismaPg(pool) });
}
