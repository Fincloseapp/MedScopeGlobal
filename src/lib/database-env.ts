const PLACEHOLDER_PATTERN = /\[(PASSWORD|REF|HESLO)\]/i;

export function hasPlaceholderConnectionString(value?: string) {
  return Boolean(value && PLACEHOLDER_PATTERN.test(value));
}

function isValidConnectionString(value?: string): value is string {
  return Boolean(value && !hasPlaceholderConnectionString(value));
}

function buildUrlFromParts(mode: "direct" | "pooler") {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.POSTGRES_HOST;
  const database = process.env.POSTGRES_DATABASE ?? "postgres";
  if (!user || !host || !isValidConnectionString(password)) return undefined;

  const encodedPassword = encodeURIComponent(password);
  if (mode === "direct") {
    return `postgresql://${user}:${encodedPassword}@${host}:5432/${database}`;
  }

  return undefined;
}

export function getResolvedDatabaseUrls() {
  const pooled = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
    buildUrlFromParts("pooler")
  ].find(isValidConnectionString);

  const direct = [
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DIRECT_URL,
    buildUrlFromParts("direct")
  ].find(isValidConnectionString);

  return { pooled, direct };
}

export function hasDatabaseEnvConfigured() {
  const { pooled, direct } = getResolvedDatabaseUrls();
  return Boolean(pooled || direct);
}

export function getDatabaseConfigurationIssue(): string | null {
  if (hasDatabaseEnvConfigured()) return null;

  const hasLegacyVars = Boolean(process.env.DATABASE_URL || process.env.DIRECT_URL);
  const hasIntegrationVars = Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_PASSWORD
  );

  if (!hasLegacyVars && !hasIntegrationVars) {
    return "Databáze není nakonfigurována. Propojte Supabase integraci ve Vercel Marketplace.";
  }

  if (
    hasPlaceholderConnectionString(process.env.DATABASE_URL) ||
    hasPlaceholderConnectionString(process.env.DIRECT_URL)
  ) {
    return "Staré proměnné DATABASE_URL/DIRECT_URL obsahují [PASSWORD]. Použijte Supabase integraci ve Vercel nebo je aktualizujte.";
  }

  return "Supabase proměnné jsou nastaveny, ale chybí platný connection string.";
}

export function resolveRuntimeConnectionString(): string | null {
  if (getDatabaseConfigurationIssue()) return null;
  const { pooled, direct } = getResolvedDatabaseUrls();
  return pooled ?? direct ?? null;
}

export function resolveMigrationConnectionString(): string | null {
  if (getDatabaseConfigurationIssue()) return null;
  const { pooled, direct } = getResolvedDatabaseUrls();
  return direct ?? pooled ?? null;
}

export function getDatabaseEnvSource(): "integration" | "legacy" | "none" {
  if (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PASSWORD
  ) {
    return "integration";
  }
  if (process.env.DATABASE_URL || process.env.DIRECT_URL) return "legacy";
  return "none";
}
