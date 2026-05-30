import { generateArticle } from "@/lib/portal/article-generator";
import { hasPermission } from "@/lib/portal/rbac";
import { errorResponse, getSessionUserFromRequest, jsonResponse } from "@/lib/portal/request";
import { createArticle } from "@/lib/portal/repository";
import { generateArticleSchema } from "@/lib/portal/validation";

export async function POST(request: Request) {
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "articles:generate")) {
    return errorResponse("Nemáte oprávnění generovat články", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = generateArticleSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Neplatná data");

  const generated = generateArticle(parsed.data, user.id, user.name);
  const article = await createArticle({ ...generated, ratingSum: 0, ratingCount: 0 });
  return jsonResponse({ article }, { status: 201 });
}
