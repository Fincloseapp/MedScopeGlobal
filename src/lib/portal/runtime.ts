import { getPrisma } from "@/lib/persistence";

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function hasDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function hasDatabaseBackend() {
  return Boolean(process.env.DATABASE_URL && getPrisma());
}

export function shouldUseMemoryStore() {
  if (process.env.VITEST || process.env.NODE_ENV === "test") return true;
  if (process.env.ALLOW_MEMORY_STORE === "true") return true;
  if (hasDatabaseBackend()) return false;
  return !isProductionRuntime();
}

export function getDatabaseStatus() {
  if (!hasDatabaseConfigured()) {
    return isProductionRuntime() ? "missing_in_production" : "not_configured";
  }
  if (!getPrisma()) return "client_unavailable";
  return "connected";
}
