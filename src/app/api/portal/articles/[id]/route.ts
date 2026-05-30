import { canEditArticle, canReadArticle, hasPermission } from "@/lib/portal/rbac";
import { errorResponse, getSessionUserFromRequest, jsonResponse } from "@/lib/portal/request";
import { deleteArticle, getArticleById, updateArticle } from "@/lib/portal/repository";
import { articleInputSchema } from "@/lib/portal/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = getSessionUserFromRequest(request);
  const article = await getArticleById(id);
  if (!article) return errorResponse("Článek nenalezen", 404);
  if (!canReadArticle(article.status, user)) return errorResponse("Článek není dostupný", 403);
  return jsonResponse({ article });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "articles:edit")) return errorResponse("Nemáte oprávnění editovat články", 403);

  const article = await getArticleById(id);
  if (!article) return errorResponse("Článek nenalezen", 404);
  if (!canEditArticle(article.authorId, user)) return errorResponse("Můžete editovat pouze vlastní články", 403);

  const body = await request.json().catch(() => null);
  const parsed = articleInputSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Neplatná data");

  const updated = await updateArticle(id, {
    title: parsed.data.title,
    summary: parsed.data.summary,
    sections: parsed.data.sections,
    clinicalSignificance: parsed.data.clinicalSignificance,
    practiceRecommendations: parsed.data.practiceRecommendations,
    citations: parsed.data.citations.map((item) => ({ ...item, sourceUrl: item.sourceUrl || undefined })),
    tags: parsed.data.tags,
    icdCodes: parsed.data.icdCodes,
    specialization: parsed.data.specialization,
    readingTime: Math.max(5, Math.round(parsed.data.sections.reduce((sum, s) => sum + s.content.length, 0) / 900))
  });

  return jsonResponse({ article: updated });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "articles:delete")) return errorResponse("Nemáte oprávnění mazat články", 403);

  const article = await getArticleById(id);
  if (!article) return errorResponse("Článek nenalezen", 404);
  if (!canEditArticle(article.authorId, user)) return errorResponse("Můžete mazat pouze vlastní články", 403);

  await deleteArticle(id);
  return jsonResponse({ ok: true });
}
