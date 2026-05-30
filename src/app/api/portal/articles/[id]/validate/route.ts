import { hasPermission } from "@/lib/portal/rbac";
import { errorResponse, getSessionUserFromRequest, jsonResponse } from "@/lib/portal/request";
import { getArticleById, updateArticle } from "@/lib/portal/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "articles:validate")) return errorResponse("Nemáte oprávnění validovat články", 403);

  const article = getArticleById(id);
  if (!article) return errorResponse("Článek nenalezen", 404);

  const updated = updateArticle(id, {
    validatedById: user.id,
    validatedAt: new Date().toISOString()
  });

  return jsonResponse({ article: updated });
}
