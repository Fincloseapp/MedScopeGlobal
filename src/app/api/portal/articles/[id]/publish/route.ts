import { hasPermission, canEditArticle } from "@/lib/portal/rbac";
import { errorResponse, getSessionUserFromRequest, jsonResponse } from "@/lib/portal/request";
import { getArticleById, updateArticle } from "@/lib/portal/repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "articles:publish")) return errorResponse("Nemáte oprávnění publikovat články", 403);

  const article = await getArticleById(id);
  if (!article) return errorResponse("Článek nenalezen", 404);
  if (!canEditArticle(article.authorId, user)) return errorResponse("Můžete publikovat pouze vlastní články", 403);
  if (article.citations.length === 0) return errorResponse("Článek musí obsahovat alespoň jednu citaci", 400);

  const updated = await updateArticle(id, {
    status: "published",
    publishedAt: new Date().toISOString()
  });

  return jsonResponse({ article: updated });
}
