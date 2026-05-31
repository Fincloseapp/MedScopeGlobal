import { hasPermission } from "@/lib/portal/rbac";
import { errorResponse, getSessionUserFromRequest, jsonResponse } from "@/lib/portal/request";
import { getArticleById, rateArticle, getUserRating } from "@/lib/portal/repository";
import { ratingSchema } from "@/lib/portal/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "articles:rate")) return errorResponse("Pro hodnocení se přihlaste", 401);

  const article = await getArticleById(id);
  if (!article || article.status !== "published") return errorResponse("Článek nenalezen", 404);

  const body = await request.json().catch(() => null);
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Neplatné hodnocení");

  const updated = await rateArticle(user.id, id, parsed.data.score);
  return jsonResponse({ article: updated, userRating: await getUserRating(user.id, id) });
}
