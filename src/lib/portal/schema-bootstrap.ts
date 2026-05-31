import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";
import { getResolvedDatabaseUrls } from "@/lib/database-env";
import { getPrisma } from "@/lib/persistence";

function sanitizeConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("sslaccept");
    return url.toString();
  } catch {
    return connectionString;
  }
}

function resolveMigrationConnectionString() {
  const { direct, pooled } = getResolvedDatabaseUrls();
  return direct ?? pooled ?? null;
}

async function applyMigrationFiles(pool: Pool) {
  const migrationsDir = join(process.cwd(), "prisma/migrations");
  if (!existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found at ${migrationsDir}`);
  }

  const migrationDirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const dir of migrationDirs) {
    const sqlPath = join(migrationsDir, dir, "migration.sql");
    const sql = readFileSync(sqlPath, "utf8");
    await pool.query(sql);
  }
}

export async function ensureDatabaseSchema() {
  const prisma = getPrisma();
  if (!prisma) return;

  try {
    await prisma.$queryRawUnsafe('SELECT 1 FROM "PortalUser" LIMIT 1');
    return;
  } catch {
    // Bootstrap schema below.
  }

  const connectionString = resolveMigrationConnectionString();
  if (!connectionString) {
    throw new Error("No migration connection string available.");
  }

  if (process.env.VERCEL === "1") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const pool = new Pool({
    connectionString: sanitizeConnectionString(connectionString),
    max: 1,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await applyMigrationFiles(pool);
  } finally {
    await pool.end();
  }
}
