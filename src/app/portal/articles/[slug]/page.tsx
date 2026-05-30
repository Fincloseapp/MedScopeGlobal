import { notFound } from "next/navigation";
import { ArticleReader } from "@/components/portal/article-reader";
import { isVerifiedExpert } from "@/lib/portal/rbac";
import { getSessionUser } from "@/lib/portal/request";
import { canReadArticle } from "@/lib/portal/rbac";
import { getArticleBySlugFromStore, getRelatedArticles } from "@/lib/portal/store";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PortalArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlugFromStore(slug);
  if (!article) notFound();

  const user = await getSessionUser();
  if (!canReadArticle(article.status, user)) notFound();

  const related = getRelatedArticles(article);
  const canManage = Boolean(user && isVerifiedExpert(user) && (user.role === "admin" || article.authorId === user.id));

  return <ArticleReader article={article} related={related} canManage={canManage} />;
}
