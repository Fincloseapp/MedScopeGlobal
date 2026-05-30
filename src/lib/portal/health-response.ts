import { ensurePortalDatabaseReady } from "./db-init";
import { getDatabaseStatus, hasDatabaseConfigured } from "./runtime";
import { jsonResponse } from "./request";
import { getPrisma } from "@/lib/persistence";

export async function getPortalHealthResponse() {
  const status = getDatabaseStatus();
  let articleCount: number | null = null;
  let userCount: number | null = null;

  if (status === "connected") {
    try {
      await ensurePortalDatabaseReady();
      const prisma = getPrisma();
      if (prisma) {
        articleCount = await prisma.portalArticle.count();
        userCount = await prisma.portalUser.count();
      }
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          database: status,
          configured: hasDatabaseConfigured(),
          error: error instanceof Error ? error.message : "Database check failed"
        },
        { status: 503 }
      );
    }
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
