import { hasPermission } from "@/lib/portal/rbac";
import { errorResponse, getSessionUserFromRequest, jsonResponse } from "@/lib/portal/request";
import { getArticleById, isArticleSaved, saveArticle, unsaveArticle } from "@/lib/portal/repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = getSessionUserFromRequest(request);
  if (!user) return jsonResponse({ saved: false });
  return jsonResponse({ saved: await isArticleSaved(user.id, id) });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "articles:save")) return errorResponse("Pro ukládání se přihlaste", 401);

  const article = await getArticleById(id);
  if (!article || article.status !== "published") return errorResponse("Článek nenalezen", 404);

  await saveArticle(user.id, id);
  return jsonResponse({ saved: true });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = getSessionUserFromRequest(request);
  if (!user) return errorResponse("Pro ukládání se přihlaste", 401);

  await unsaveArticle(user.id, id);
  return jsonResponse({ saved: false });
}
