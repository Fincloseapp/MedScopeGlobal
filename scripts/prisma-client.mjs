import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function resolveMigrationUrl() {
  return [
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DIRECT_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL
  ].find((value) => value && !/\[(PASSWORD|REF|HESLO)\]/i.test(value));
}

function normalizeConnectionString(connectionString) {
  if (!connectionString.includes("supabase")) return connectionString;
  if (/sslmode=/i.test(connectionString)) return connectionString;
  const separator = connectionString.includes("?") ? "&" : "?";
  return `${connectionString}${separator}sslmode=no-verify`;
}

export function createSeedPrismaClient() {
  const raw = resolveMigrationUrl();
  if (!raw) return new PrismaClient();

  const connectionString = normalizeConnectionString(raw);
  const pool = new Pool({
    connectionString,
    max: 1,
    ssl: { rejectUnauthorized: false }
  });

  return new PrismaClient({ adapter: new PrismaPg(pool) });
}
