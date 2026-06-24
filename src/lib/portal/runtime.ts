import { getDatabaseConfigurationIssue, getDatabaseEnvSource, hasDatabaseEnvConfigured } from "@/lib/database-env";
import { getPrisma } from "@/lib/persistence";

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function hasDatabaseConfigured() {
  return hasDatabaseEnvConfigured();
}

export { getDatabaseEnvSource };

export function hasDatabaseBackend() {
  if (getDatabaseConfigurationIssue()) return false;
  if (!hasDatabaseConfigured()) return false;
  try {
    return Boolean(getPrisma());
  } catch {
    return false;
  }
}

export function shouldUseMemoryStore() {
  if (process.env.VITEST || process.env.NODE_ENV === "test") return true;
  if (process.env.ALLOW_MEMORY_STORE === "true") return true;
  return !hasDatabaseBackend();
}

export function getDatabaseStatus() {
  if (shouldUseMemoryStore()) {
    if (getDatabaseConfigurationIssue()) return "invalid_configuration";
    if (!hasDatabaseConfigured()) {
      return isProductionRuntime() ? "missing_in_production" : "not_configured";
    }
    return "memory_fallback";
  }
  return "connected";
}

export function getDatabaseWarning(): string | null {
  return getDatabaseConfigurationIssue();
}
