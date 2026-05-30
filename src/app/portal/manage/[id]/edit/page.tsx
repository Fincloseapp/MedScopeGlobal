import { notFound, redirect } from "next/navigation";
import { ArticleEditor } from "@/components/portal/article-editor";
import { canEditArticle, isVerifiedExpert } from "@/lib/portal/rbac";
import { getSessionUser } from "@/lib/portal/request";
import { getArticleById } from "@/lib/portal/repository";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  if (!isVerifiedExpert(user)) redirect("/portal/manage");

  const article = await getArticleById(id);
  if (!article) notFound();
  if (!canEditArticle(article.authorId, user)) notFound();

  return (
    <main className="section">
      <p className="eyebrow">Editace článku</p>
      <h1>{article.title}</h1>
      <ArticleEditor article={article} />
    </main>
  );
}
