import { notFound } from "next/navigation";
import { ArticleReader } from "@/components/portal/article-reader";
import { isVerifiedExpert, canReadArticle } from "@/lib/portal/rbac";
import { getSessionUser } from "@/lib/portal/request";
import { getArticleBySlugFromStore, getRelatedArticles } from "@/lib/portal/repository";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlugFromStore(slug);
  if (!article) notFound();

  const user = await getSessionUser();
  if (!canReadArticle(article.status, user)) notFound();

  const related = await getRelatedArticles(article);
  const canManage = Boolean(user && isVerifiedExpert(user) && (user.role === "admin" || article.authorId === user.id));

  return <ArticleReader article={article} related={related} canManage={canManage} />;
}
