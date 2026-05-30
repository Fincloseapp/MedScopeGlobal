import { getPrisma } from "@/lib/persistence";
import { mapArticleFromDb, mapArticleToDb, mapUserFromDb, mapUserToDb } from "./db-mapper";
import type { ArticleFilters, PortalArticle, PortalUser, SavedArticle } from "./types";
import { slugify } from "./validation";
import type { Prisma } from "@prisma/client";

function toJson<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("cs-CZ");
}

function applyFilters(items: PortalArticle[], filters: ArticleFilters, viewerRole?: string) {
  let result = items;
  if (viewerRole !== "admin" && viewerRole !== "expert") {
    result = result.filter((item) => item.status === "published");
  }
  const query = normalized(filters.query ?? "");
  if (query) {
    result = result.filter((article) =>
      [article.title, article.summary, article.specialization, article.tags.join(" "), article.clinicalSignificance, article.practiceRecommendations]
        .some((value) => normalized(value).includes(query))
    );
  }
  if (filters.specialization) result = result.filter((item) => item.specialization === filters.specialization);
  if (filters.status) result = result.filter((item) => item.status === filters.status);
  if (filters.tag) result = result.filter((item) => item.tags.includes(filters.tag!));
  if (filters.authorId) result = result.filter((item) => item.authorId === filters.authorId);
  if (filters.from) result = result.filter((item) => (item.publishedAt ?? item.createdAt) >= filters.from!);
  if (filters.to) result = result.filter((item) => (item.publishedAt ?? item.createdAt) <= filters.to!);

  switch (filters.sort) {
    case "oldest":
      result.sort((a, b) => new Date(a.publishedAt ?? a.createdAt).getTime() - new Date(b.publishedAt ?? b.createdAt).getTime());
      break;
    case "rating":
      result.sort((a, b) => (b.ratingCount ? b.ratingSum / b.ratingCount : 0) - (a.ratingCount ? a.ratingSum / a.ratingCount : 0));
      break;
    case "relevance":
      if (query) {
        result.sort((a, b) => {
          const score = (article: PortalArticle) =>
            (normalized(article.title).includes(query) ? 3 : 0) +
            (normalized(article.summary).includes(query) ? 2 : 0) +
            (article.tags.some((tag) => normalized(tag).includes(query)) ? 1 : 0);
          return score(b) - score(a);
        });
      } else {
        result.sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime());
      }
      break;
    default:
      result.sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime());
  }
  return result;
}

export async function dbListArticles(filters: ArticleFilters = {}, viewerRole?: string): Promise<PortalArticle[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  const rows = await prisma.portalArticle.findMany({ orderBy: { updatedAt: "desc" } });
  return applyFilters(rows.map(mapArticleFromDb), filters, viewerRole);
}

export async function dbGetArticleById(id: string): Promise<PortalArticle | undefined> {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  const row = await prisma.portalArticle.findUnique({ where: { id } });
  return row ? mapArticleFromDb(row) : undefined;
}

export async function dbGetArticleBySlug(slug: string): Promise<PortalArticle | undefined> {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  const row = await prisma.portalArticle.findUnique({ where: { slug } });
  return row ? mapArticleFromDb(row) : undefined;
}

export async function dbGetUserByEmail(email: string): Promise<PortalUser | undefined> {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  const row = await prisma.portalUser.findUnique({ where: { email: email.toLowerCase() } });
  return row ? mapUserFromDb(row) : undefined;
}

export async function dbGetUserById(id: string): Promise<PortalUser | undefined> {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  const row = await prisma.portalUser.findUnique({ where: { id } });
  return row ? mapUserFromDb(row) : undefined;
}

export async function dbCreateUser(user: PortalUser): Promise<PortalUser> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("NO_DATABASE");
  const row = await prisma.portalUser.create({ data: mapUserToDb(user) });
  return mapUserFromDb(row);
}

export async function dbUpdateUser(id: string, patch: Partial<PortalUser>): Promise<PortalUser> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("NO_DATABASE");
  const current = await prisma.portalUser.findUnique({ where: { id } });
  if (!current) throw new Error("NOT_FOUND");
  const merged = mapUserFromDb(current);
  const updated = { ...merged, ...patch, updatedAt: new Date().toISOString() };
  const row = await prisma.portalUser.update({ where: { id }, data: mapUserToDb(updated) });
  return mapUserFromDb(row);
}

export async function dbCreateArticle(article: PortalArticle): Promise<PortalArticle> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("NO_DATABASE");
  let slug = article.slug || slugify(article.title);
  let counter = 1;
  while (await prisma.portalArticle.findUnique({ where: { slug } })) {
    slug = `${slugify(article.title)}-${counter++}`;
  }
  const row = await prisma.portalArticle.create({ data: { ...mapArticleToDb({ ...article, slug }), sections: toJson(article.sections), citations: toJson(article.citations) } });
  return mapArticleFromDb(row);
}

export async function dbUpdateArticle(id: string, patch: Partial<PortalArticle>): Promise<PortalArticle> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("NO_DATABASE");
  const current = await prisma.portalArticle.findUnique({ where: { id } });
  if (!current) throw new Error("NOT_FOUND");
  const merged = { ...mapArticleFromDb(current), ...patch, updatedAt: new Date().toISOString() };
  const mapped = mapArticleToDb(merged);
  const row = await prisma.portalArticle.update({
    where: { id },
    data: { ...mapped, sections: toJson(merged.sections), citations: toJson(merged.citations) }
  });
  return mapArticleFromDb(row);
}

export async function dbDeleteArticle(id: string): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("NO_DATABASE");
  await prisma.portalArticle.delete({ where: { id } });
}

export async function dbSaveArticle(userId: string, articleId: string): Promise<SavedArticle> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("NO_DATABASE");
  const saved = await prisma.savedArticle.upsert({
    where: { userId_articleId: { userId, articleId } },
    update: { savedAt: new Date() },
    create: { userId, articleId, savedAt: new Date() }
  });
  return { userId: saved.userId, articleId: saved.articleId, savedAt: saved.savedAt.toISOString() };
}

export async function dbUnsaveArticle(userId: string, articleId: string): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("NO_DATABASE");
  await prisma.savedArticle.deleteMany({ where: { userId, articleId } });
}

export async function dbIsArticleSaved(userId: string, articleId: string): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;
  const row = await prisma.savedArticle.findUnique({ where: { userId_articleId: { userId, articleId } } });
  return Boolean(row);
}

export async function dbRateArticle(userId: string, articleId: string, score: number): Promise<PortalArticle> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("NO_DATABASE");
  const article = await prisma.portalArticle.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("NOT_FOUND");

  const existing = await prisma.articleRating.findUnique({ where: { userId_articleId: { userId, articleId } } });
  let ratingSum = article.ratingSum;
  let ratingCount = article.ratingCount;
  if (existing) {
    ratingSum = ratingSum - existing.score + score;
    await prisma.articleRating.update({ where: { userId_articleId: { userId, articleId } }, data: { score } });
  } else {
    ratingSum += score;
    ratingCount += 1;
    await prisma.articleRating.create({ data: { userId, articleId, score } });
  }

  const row = await prisma.portalArticle.update({ where: { id: articleId }, data: { ratingSum, ratingCount } });
  return mapArticleFromDb(row);
}

export async function dbGetUserRating(userId: string, articleId: string): Promise<number | undefined> {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  const row = await prisma.articleRating.findUnique({ where: { userId_articleId: { userId, articleId } } });
  return row?.score;
}

export async function dbListPendingExperts(): Promise<PortalUser[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  const rows = await prisma.portalUser.findMany({ where: { role: "EXPERT", verificationStatus: "PENDING" } });
  return rows.map(mapUserFromDb);
}

export async function dbListSavedArticles(userId: string): Promise<PortalArticle[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  const rows = await prisma.savedArticle.findMany({
    where: { userId },
    include: { article: true },
    orderBy: { savedAt: "desc" }
  });
  return rows.map((row) => mapArticleFromDb(row.article));
}

export async function dbCountUsers(): Promise<number> {
  const prisma = getPrisma();
  if (!prisma) return 0;
  return prisma.portalUser.count();
}
