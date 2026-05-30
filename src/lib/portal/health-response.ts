import { ensurePortalDatabaseReady } from "./db-init";
import { getDatabaseStatus, hasDatabaseConfigured } from "./runtime";
import { jsonResponse } from "./request";
import { getPrisma, getDatabaseConfigurationIssue } from "@/lib/persistence";

export async function buildPortalHealthResponse() {
  const configIssue = getDatabaseConfigurationIssue();
  const status = getDatabaseStatus();
  let articleCount: number | null = null;
  let userCount: number | null = null;
  let error: string | undefined = configIssue ?? undefined;

  if (!error && status === "connected") {
    try {
      await ensurePortalDatabaseReady();
      const prisma = getPrisma();
      if (prisma) {
        articleCount = await prisma.portalArticle.count();
        userCount = await prisma.portalUser.count();
      }
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Database check failed";
    }
  }

  if (error) {
    return jsonResponse(
      {
        ok: false,
        database: status,
        configured: hasDatabaseConfigured(),
        error
      },
      { status: 503 }
    );
  }

  return jsonResponse({
    ok: status === "connected" || status === "not_configured",
    database: status,
    configured: hasDatabaseConfigured(),
    articles: articleCount,
    users: userCount,
    site: process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com"
  });
}
