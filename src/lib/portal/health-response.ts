import { ensurePortalDatabaseReady } from "./db-init";
import { getDatabaseStatus, getDatabaseWarning, hasDatabaseConfigured, shouldUseMemoryStore } from "./runtime";
import { jsonResponse } from "./request";
import { getMemoryStoreCounts } from "./store";
import { getPrisma } from "@/lib/persistence";

export async function buildPortalHealthResponse() {
  const status = getDatabaseStatus();
  const warning = getDatabaseWarning();
  let articleCount: number | null = null;
  let userCount: number | null = null;

  if (shouldUseMemoryStore()) {
    const counts = getMemoryStoreCounts();
    articleCount = counts.articles;
    userCount = counts.users;
    return jsonResponse({
      ok: true,
      database: status,
      mode: "memory_fallback",
      configured: hasDatabaseConfigured(),
      warning,
      articles: articleCount,
      users: userCount,
      site: process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com"
    });
  }

  try {
    await ensurePortalDatabaseReady();
    const prisma = getPrisma();
    if (prisma) {
      articleCount = await prisma.portalArticle.count();
      userCount = await prisma.portalUser.count();
    }
  } catch (cause) {
    const counts = getMemoryStoreCounts();
    return jsonResponse({
      ok: true,
      database: "memory_fallback",
      mode: "memory_fallback",
      configured: hasDatabaseConfigured(),
      warning: cause instanceof Error ? cause.message : "Database check failed",
      articles: counts.articles,
      users: counts.users,
      site: process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com"
    });
  }

  return jsonResponse({
    ok: true,
    database: "connected",
    mode: "database",
    configured: hasDatabaseConfigured(),
    articles: articleCount,
    users: userCount,
    site: process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com"
  });
}
