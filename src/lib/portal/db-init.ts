import { execSync } from "node:child_process";
import { seedDemoAdmin, seedDemoExpert, seedDemoReader, generateArticle } from "./article-generator";
import { mapUserToDb, mapArticleToDb } from "./db-mapper";
import { getPrisma } from "@/lib/persistence";
import { hasDatabaseBackend } from "./runtime";
import type { Prisma } from "@prisma/client";

declare global {
  var __medscopePortalDbInit: Promise<void> | undefined;
}

function toJson<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function ensureSchema() {
  const prisma = getPrisma();
  if (!prisma) return;

  try {
    await prisma.$queryRawUnsafe('SELECT 1 FROM "PortalUser" LIMIT 1');
    return;
  } catch {
    // Schema not present yet – bootstrap below.
  }

  if (process.env.VERCEL === "1") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  execSync("npx prisma db push --accept-data-loss", {
    stdio: "pipe",
    env: process.env
  });
}

async function runSeed() {
  const prisma = getPrisma();
  if (!prisma) return;

  const existingUsers = await prisma.portalUser.count();
  if (existingUsers > 0) return;

  const expert = seedDemoExpert();
  const reader = seedDemoReader();
  const admin = seedDemoAdmin();

  for (const user of [expert, reader, admin]) {
    await prisma.portalUser.create({ data: mapUserToDb(user) });
  }

  const generated = generateArticle(
    { topic: "Kardiovaskulární prevence v primární péči", keywords: ["prevence", "TK", "ESC"], specialization: "Kardiologie" },
    expert.id,
    expert.name
  );

  const article = {
    ...generated,
    status: "published" as const,
    publishedAt: new Date().toISOString(),
    ratingSum: 0,
    ratingCount: 0
  };

  const mapped = mapArticleToDb(article);
  await prisma.portalArticle.create({
    data: {
      ...mapped,
      sections: toJson(article.sections),
      citations: toJson(article.citations)
    }
  });
}

export function ensurePortalDatabaseReady() {
  if (!hasDatabaseBackend()) return Promise.resolve();
  if (!globalThis.__medscopePortalDbInit) {
    globalThis.__medscopePortalDbInit = ensureSchema()
      .then(runSeed)
      .catch((error) => {
        console.error("[portal-db-init]", error);
        globalThis.__medscopePortalDbInit = undefined;
      });
  }
  return globalThis.__medscopePortalDbInit;
}
