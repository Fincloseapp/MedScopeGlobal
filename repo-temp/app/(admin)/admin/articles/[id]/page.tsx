import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { getCategories } from "@/lib/queries/categories";
import { getArticleForAdmin } from "@/lib/queries/article-admin";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const [categories, article] = await Promise.all([
    getCategories(),
    getArticleForAdmin(id),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          Edit article
        </h1>
        <p className="text-muted-foreground">
          Updating does not notify subscribers automatically.
        </p>
      </div>
      <ArticleForm categories={categories} article={article} />
    </div>
  );
}
