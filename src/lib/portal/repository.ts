import * as db from "./db-store";
import * as memory from "./store";
import { ensurePortalDatabaseReady } from "./db-init";
import { hasDatabaseBackend } from "./runtime";
import type { ArticleFilters, PortalArticle, PortalUser, SavedArticle } from "./types";

async function withDatabase<T>(dbFn: () => Promise<T>, memoryFn: () => T | Promise<T>): Promise<T> {
  if (hasDatabaseBackend()) {
    await ensurePortalDatabaseReady();
    return dbFn();
  }
  return memoryFn();
}

export async function listArticles(filters: ArticleFilters = {}, viewerId?: string, viewerRole?: string): Promise<PortalArticle[]> {
  if (hasDatabaseBackend()) {
    await ensurePortalDatabaseReady();
    return db.dbListArticles(filters, viewerRole);
  }
  return memory.listArticles(filters, viewerId, viewerRole);
}

export async function getArticleById(id: string): Promise<PortalArticle | undefined> {
  return withDatabase(() => db.dbGetArticleById(id), () => memory.getArticleById(id));
}

export async function getArticleBySlugFromStore(slug: string): Promise<PortalArticle | undefined> {
  return withDatabase(() => db.dbGetArticleBySlug(slug), () => memory.getArticleBySlugFromStore(slug));
}

export async function getUserByEmail(email: string): Promise<PortalUser | undefined> {
  return withDatabase(() => db.dbGetUserByEmail(email), () => memory.getUserByEmail(email));
}

export async function getUserById(id: string): Promise<PortalUser | undefined> {
  return withDatabase(() => db.dbGetUserById(id), () => memory.getUserById(id));
}

export async function createUser(user: PortalUser): Promise<PortalUser> {
  if (hasDatabaseBackend()) {
    await ensurePortalDatabaseReady();
    const existing = await db.dbGetUserByEmail(user.email);
    if (existing) throw new Error("USER_EXISTS");
    return db.dbCreateUser(user);
  }
  return memory.createUser(user);
}

export async function updateUser(id: string, patch: Partial<PortalUser>): Promise<PortalUser> {
  return withDatabase(() => db.dbUpdateUser(id, patch), () => memory.updateUser(id, patch));
}

export async function createArticle(article: PortalArticle): Promise<PortalArticle> {
  return withDatabase(() => db.dbCreateArticle(article), () => memory.createArticle(article));
}

export async function updateArticle(id: string, patch: Partial<PortalArticle>): Promise<PortalArticle> {
  return withDatabase(() => db.dbUpdateArticle(id, patch), () => memory.updateArticle(id, patch));
}

export async function deleteArticle(id: string): Promise<void> {
  if (hasDatabaseBackend()) return db.dbDeleteArticle(id);
  return memory.deleteArticle(id);
}

export async function saveArticle(userId: string, articleId: string): Promise<SavedArticle> {
  return withDatabase(() => db.dbSaveArticle(userId, articleId), () => memory.saveArticle(userId, articleId));
}

export async function unsaveArticle(userId: string, articleId: string): Promise<void> {
  if (hasDatabaseBackend()) return db.dbUnsaveArticle(userId, articleId);
  return memory.unsaveArticle(userId, articleId);
}

export async function isArticleSaved(userId: string, articleId: string): Promise<boolean> {
  return withDatabase(() => db.dbIsArticleSaved(userId, articleId), () => memory.isArticleSaved(userId, articleId));
}

export async function rateArticle(userId: string, articleId: string, score: number): Promise<PortalArticle> {
  return withDatabase(() => db.dbRateArticle(userId, articleId, score), () => memory.rateArticle(userId, articleId, score));
}

export async function getRelatedArticles(article: PortalArticle, limit = 3): Promise<PortalArticle[]> {
  const items = await listArticles({ specialization: article.specialization, sort: "newest" });
  return items.filter((item) => item.id !== article.id && item.status === "published").slice(0, limit);
}

export async function listPendingExperts(): Promise<PortalUser[]> {
  return withDatabase(() => db.dbListPendingExperts(), () => memory.listPendingExperts());
}

export async function getUserRating(userId: string, articleId: string): Promise<number | undefined> {
  return withDatabase(() => db.dbGetUserRating(userId, articleId), () => memory.getUserRating(userId, articleId));
}

export async function listSavedArticles(userId: string): Promise<PortalArticle[]> {
  return withDatabase(() => db.dbListSavedArticles(userId), () => memory.listSavedArticles(userId));
}

export { resetPortalStore } from "./store";
