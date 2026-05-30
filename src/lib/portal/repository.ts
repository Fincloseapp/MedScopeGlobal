import { getPrisma } from "@/lib/persistence";
import * as db from "./db-store";
import * as memory from "./store";
import type { ArticleFilters, PortalArticle, PortalUser, SavedArticle } from "./types";

function useDatabase() {
  return Boolean(process.env.DATABASE_URL && getPrisma());
}

export async function listArticles(filters: ArticleFilters = {}, viewerId?: string, viewerRole?: string): Promise<PortalArticle[]> {
  if (useDatabase()) return db.dbListArticles(filters, viewerRole);
  return memory.listArticles(filters, viewerId, viewerRole);
}

export async function getArticleById(id: string): Promise<PortalArticle | undefined> {
  if (useDatabase()) return db.dbGetArticleById(id);
  return memory.getArticleById(id);
}

export async function getArticleBySlugFromStore(slug: string): Promise<PortalArticle | undefined> {
  if (useDatabase()) return db.dbGetArticleBySlug(slug);
  return memory.getArticleBySlugFromStore(slug);
}

export async function getUserByEmail(email: string): Promise<PortalUser | undefined> {
  if (useDatabase()) return db.dbGetUserByEmail(email);
  return memory.getUserByEmail(email);
}

export async function getUserById(id: string): Promise<PortalUser | undefined> {
  if (useDatabase()) return db.dbGetUserById(id);
  return memory.getUserById(id);
}

export async function createUser(user: PortalUser): Promise<PortalUser> {
  if (useDatabase()) {
    const existing = await db.dbGetUserByEmail(user.email);
    if (existing) throw new Error("USER_EXISTS");
    return db.dbCreateUser(user);
  }
  return memory.createUser(user);
}

export async function updateUser(id: string, patch: Partial<PortalUser>): Promise<PortalUser> {
  if (useDatabase()) return db.dbUpdateUser(id, patch);
  return memory.updateUser(id, patch);
}

export async function createArticle(article: PortalArticle): Promise<PortalArticle> {
  if (useDatabase()) return db.dbCreateArticle(article);
  return memory.createArticle(article);
}

export async function updateArticle(id: string, patch: Partial<PortalArticle>): Promise<PortalArticle> {
  if (useDatabase()) return db.dbUpdateArticle(id, patch);
  return memory.updateArticle(id, patch);
}

export async function deleteArticle(id: string): Promise<void> {
  if (useDatabase()) return db.dbDeleteArticle(id);
  return memory.deleteArticle(id);
}

export async function saveArticle(userId: string, articleId: string): Promise<SavedArticle> {
  if (useDatabase()) return db.dbSaveArticle(userId, articleId);
  return memory.saveArticle(userId, articleId);
}

export async function unsaveArticle(userId: string, articleId: string): Promise<void> {
  if (useDatabase()) return db.dbUnsaveArticle(userId, articleId);
  return memory.unsaveArticle(userId, articleId);
}

export async function isArticleSaved(userId: string, articleId: string): Promise<boolean> {
  if (useDatabase()) return db.dbIsArticleSaved(userId, articleId);
  return memory.isArticleSaved(userId, articleId);
}

export async function rateArticle(userId: string, articleId: string, score: number): Promise<PortalArticle> {
  if (useDatabase()) return db.dbRateArticle(userId, articleId, score);
  return memory.rateArticle(userId, articleId, score);
}

export async function getRelatedArticles(article: PortalArticle, limit = 3): Promise<PortalArticle[]> {
  const items = await listArticles({ specialization: article.specialization, sort: "newest" });
  return items.filter((item) => item.id !== article.id && item.status === "published").slice(0, limit);
}

export async function listPendingExperts(): Promise<PortalUser[]> {
  if (useDatabase()) return db.dbListPendingExperts();
  return memory.listPendingExperts();
}

export async function getUserRating(userId: string, articleId: string): Promise<number | undefined> {
  if (useDatabase()) return db.dbGetUserRating(userId, articleId);
  return memory.getUserRating(userId, articleId);
}

export async function listSavedArticles(userId: string): Promise<PortalArticle[]> {
  if (useDatabase()) return db.dbListSavedArticles(userId);
  return memory.listSavedArticles(userId);
}

export { resetPortalStore } from "./store";
