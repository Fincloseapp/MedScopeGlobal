import { generateArticle, seedDemoAdmin, seedDemoExpert, seedDemoReader } from "./article-generator";
import type { ArticleFilters, ArticleRating, PortalArticle, PortalUser, SavedArticle } from "./types";
import { slugify } from "./validation";

interface PortalStore {
  users: Map<string, PortalUser>;
  usersByEmail: Map<string, string>;
  articles: Map<string, PortalArticle>;
  articlesBySlug: Map<string, string>;
  saved: Map<string, SavedArticle>;
  ratings: Map<string, ArticleRating>;
}

declare global {
  var __medscopePortalStore: PortalStore | undefined;
}

function createStore(): PortalStore {
  return {
    users: new Map(),
    usersByEmail: new Map(),
    articles: new Map(),
    articlesBySlug: new Map(),
    saved: new Map(),
    ratings: new Map()
  };
}

export function getPortalStore(): PortalStore {
  if (!globalThis.__medscopePortalStore) {
    globalThis.__medscopePortalStore = createStore();
    seedPortalStore(globalThis.__medscopePortalStore);
  }
  return globalThis.__medscopePortalStore;
}

export function getMemoryStoreCounts() {
  const store = getPortalStore();
  return {
    articles: store.articles.size,
    users: store.users.size
  };
}

export function resetPortalStore() {
  globalThis.__medscopePortalStore = createStore();
  seedPortalStore(globalThis.__medscopePortalStore);
}

function seedPortalStore(store: PortalStore) {
  const expert = seedDemoExpert();
  const reader = seedDemoReader();
  const admin = seedDemoAdmin();
  for (const user of [expert, reader, admin]) {
    store.users.set(user.id, user);
    store.usersByEmail.set(user.email.toLowerCase(), user.id);
  }

  const published = generateArticle(
    { topic: "Kardiovaskulární prevence v primární péči", keywords: ["prevence", "TK", "ESC"], specialization: "Kardiologie" },
    expert.id,
    expert.name
  );
  const publishedArticle: PortalArticle = {
    ...published,
    status: "published",
    publishedAt: new Date().toISOString(),
    ratingSum: 9,
    ratingCount: 2
  };
  store.articles.set(publishedArticle.id, publishedArticle);
  store.articlesBySlug.set(publishedArticle.slug, publishedArticle.id);

  const draft = generateArticle(
    { topic: "Biologická léčba revmatoidní artritidy", keywords: ["RA", "bDMARD", "EULAR"], specialization: "Revmatologie" },
    expert.id,
    expert.name
  );
  const draftArticle: PortalArticle = { ...draft, ratingSum: 0, ratingCount: 0 };
  store.articles.set(draftArticle.id, draftArticle);
  store.articlesBySlug.set(draftArticle.slug, draftArticle.id);
}

function ratingKey(userId: string, articleId: string) {
  return `${userId}:${articleId}`;
}

function savedKey(userId: string, articleId: string) {
  return `${userId}:${articleId}`;
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("cs-CZ");
}

export function listArticles(filters: ArticleFilters = {}, viewerId?: string, viewerRole?: string): PortalArticle[] {
  const store = getPortalStore();
  let items = [...store.articles.values()];

  if (viewerRole !== "admin" && viewerRole !== "expert") {
    items = items.filter((item) => item.status === "published");
  }

  const query = normalized(filters.query ?? "");
  if (query) {
    items = items.filter((article) =>
      [article.title, article.summary, article.specialization, article.tags.join(" "), article.clinicalSignificance, article.practiceRecommendations]
        .some((value) => normalized(value).includes(query))
    );
  }

  if (filters.specialization) items = items.filter((item) => item.specialization === filters.specialization);
  if (filters.status) items = items.filter((item) => item.status === filters.status);
  if (filters.tag) items = items.filter((item) => item.tags.includes(filters.tag!));
  if (filters.authorId) items = items.filter((item) => item.authorId === filters.authorId);
  if (filters.from) items = items.filter((item) => (item.publishedAt ?? item.createdAt) >= filters.from!);
  if (filters.to) items = items.filter((item) => (item.publishedAt ?? item.createdAt) <= filters.to!);

  switch (filters.sort) {
    case "oldest":
      items.sort((a, b) => new Date(a.publishedAt ?? a.createdAt).getTime() - new Date(b.publishedAt ?? b.createdAt).getTime());
      break;
    case "rating":
      items.sort((a, b) => (b.ratingCount ? b.ratingSum / b.ratingCount : 0) - (a.ratingCount ? a.ratingSum / a.ratingCount : 0));
      break;
    case "relevance":
      if (query) {
        items.sort((a, b) => {
          const score = (article: PortalArticle) =>
            (normalized(article.title).includes(query) ? 3 : 0) +
            (normalized(article.summary).includes(query) ? 2 : 0) +
            (article.tags.some((tag) => normalized(tag).includes(query)) ? 1 : 0);
          return score(b) - score(a);
        });
      } else {
        items.sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime());
      }
      break;
    default:
      items.sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime());
  }

  return items.map((item) => sanitizeArticle(item));
}

function sanitizeArticle(article: PortalArticle): PortalArticle {
  return {
    ...article,
    ratingSum: article.ratingSum,
    ratingCount: article.ratingCount
  };
}

export function getArticleById(id: string): PortalArticle | undefined {
  return getPortalStore().articles.get(id);
}

export function getArticleBySlugFromStore(slug: string): PortalArticle | undefined {
  const id = getPortalStore().articlesBySlug.get(slug);
  return id ? getPortalStore().articles.get(id) : undefined;
}

export function getUserByEmail(email: string): PortalUser | undefined {
  const id = getPortalStore().usersByEmail.get(email.toLowerCase());
  return id ? getPortalStore().users.get(id) : undefined;
}

export function getUserById(id: string): PortalUser | undefined {
  return getPortalStore().users.get(id);
}

export function createUser(user: PortalUser): PortalUser {
  const store = getPortalStore();
  if (store.usersByEmail.has(user.email.toLowerCase())) {
    throw new Error("USER_EXISTS");
  }
  store.users.set(user.id, user);
  store.usersByEmail.set(user.email.toLowerCase(), user.id);
  return user;
}

export function updateUser(id: string, patch: Partial<PortalUser>): PortalUser {
  const store = getPortalStore();
  const current = store.users.get(id);
  if (!current) throw new Error("NOT_FOUND");
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  store.users.set(id, updated);
  return updated;
}

export function createArticle(article: PortalArticle): PortalArticle {
  const store = getPortalStore();
  let slug = article.slug || slugify(article.title);
  let counter = 1;
  while (store.articlesBySlug.has(slug)) {
    slug = `${slugify(article.title)}-${counter++}`;
  }
  const saved = { ...article, slug };
  store.articles.set(saved.id, saved);
  store.articlesBySlug.set(saved.slug, saved.id);
  return saved;
}

export function updateArticle(id: string, patch: Partial<PortalArticle>): PortalArticle {
  const store = getPortalStore();
  const current = store.articles.get(id);
  if (!current) throw new Error("NOT_FOUND");
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  if (patch.slug && patch.slug !== current.slug) {
    store.articlesBySlug.delete(current.slug);
    store.articlesBySlug.set(updated.slug, id);
  }
  store.articles.set(id, updated);
  return updated;
}

export function deleteArticle(id: string): void {
  const store = getPortalStore();
  const current = store.articles.get(id);
  if (!current) throw new Error("NOT_FOUND");
  store.articles.delete(id);
  store.articlesBySlug.delete(current.slug);
}

export function saveArticle(userId: string, articleId: string): SavedArticle {
  const store = getPortalStore();
  if (!store.articles.has(articleId)) throw new Error("NOT_FOUND");
  const saved: SavedArticle = { userId, articleId, savedAt: new Date().toISOString() };
  store.saved.set(savedKey(userId, articleId), saved);
  return saved;
}

export function unsaveArticle(userId: string, articleId: string): void {
  getPortalStore().saved.delete(savedKey(userId, articleId));
}

export function isArticleSaved(userId: string, articleId: string): boolean {
  return getPortalStore().saved.has(savedKey(userId, articleId));
}

export function rateArticle(userId: string, articleId: string, score: number): PortalArticle {
  const store = getPortalStore();
  const article = store.articles.get(articleId);
  if (!article) throw new Error("NOT_FOUND");
  const key = ratingKey(userId, articleId);
  const existing = store.ratings.get(key);
  let ratingSum = article.ratingSum;
  let ratingCount = article.ratingCount;
  if (existing) {
    ratingSum = ratingSum - existing.score + score;
  } else {
    ratingSum += score;
    ratingCount += 1;
  }
  store.ratings.set(key, { userId, articleId, score, createdAt: new Date().toISOString() });
  return updateArticle(articleId, { ratingSum, ratingCount });
}

export function getRelatedArticles(article: PortalArticle, limit = 3): PortalArticle[] {
  return listArticles({ specialization: article.specialization, sort: "newest" })
    .filter((item) => item.id !== article.id && item.status === "published")
    .slice(0, limit);
}

export function listPendingExperts(): PortalUser[] {
  return [...getPortalStore().users.values()].filter((user) => user.role === "expert" && user.verificationStatus === "pending");
}

export function getUserRating(userId: string, articleId: string): number | undefined {
  return getPortalStore().ratings.get(ratingKey(userId, articleId))?.score;
}

export function listSavedArticles(userId: string): PortalArticle[] {
  const store = getPortalStore();
  return [...store.saved.values()]
    .filter((item) => item.userId === userId)
    .map((item) => store.articles.get(item.articleId))
    .filter((item): item is PortalArticle => Boolean(item));
}
