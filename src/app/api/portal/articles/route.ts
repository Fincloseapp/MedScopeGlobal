import { createArticleId } from "@/lib/portal/auth";
import { hasPermission } from "@/lib/portal/rbac";
import { errorResponse, getSessionUserFromRequest, jsonResponse } from "@/lib/portal/request";
import { createArticle, listArticles } from "@/lib/portal/repository";
import { articleInputSchema } from "@/lib/portal/validation";
import type { ArticleFilters, PortalArticle } from "@/lib/portal/types";

export async function GET(request: Request) {
  const user = getSessionUserFromRequest(request);
  const { searchParams } = new URL(request.url);
  const filters: ArticleFilters = {
    query: searchParams.get("q") ?? undefined,
    specialization: searchParams.get("specialization") ?? undefined,
    status: (searchParams.get("status") as ArticleFilters["status"]) ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    sort: (searchParams.get("sort") as ArticleFilters["sort"]) ?? "newest",
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined
  };
  const articles = await listArticles(filters, user?.id, user?.role);
  return jsonResponse({ articles, total: articles.length });
}

export async function POST(request: Request) {
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "articles:create")) {
    return errorResponse("Nemáte oprávnění vytvářet články", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = articleInputSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Neplatná data");

  const article: PortalArticle = {
    id: createArticleId(),
    slug: "",
    title: parsed.data.title,
    summary: parsed.data.summary,
    sections: parsed.data.sections,
    clinicalSignificance: parsed.data.clinicalSignificance,
    practiceRecommendations: parsed.data.practiceRecommendations,
    citations: parsed.data.citations.map((item) => ({ ...item, sourceUrl: item.sourceUrl || undefined })),
    tags: parsed.data.tags,
    icdCodes: parsed.data.icdCodes,
    specialization: parsed.data.specialization,
    status: "draft",
    authorId: user.id,
    authorName: user.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readingTime: Math.max(5, Math.round(parsed.data.sections.reduce((sum, s) => sum + s.content.length, 0) / 900)),
    ratingSum: 0,
    ratingCount: 0
  };

  return jsonResponse({ article: await createArticle(article) }, { status: 201 });
}
