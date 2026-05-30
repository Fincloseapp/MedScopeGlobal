export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.SENTRY_DSN) {
      await import("./sentry.server.config");
    }
    if (process.env.DATABASE_URL) {
      const { ensurePortalDatabaseReady } = await import("./src/lib/portal/db-init");
      await ensurePortalDatabaseReady().catch(() => undefined);
    }
  }
}
