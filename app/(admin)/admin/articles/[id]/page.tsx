import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { loadAdminCategoriesForForm } from "@/lib/admin/overview";
import { getArticleForAdmin } from "@/lib/queries/article-admin";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const [categories, article] = await Promise.all([
    loadAdminCategoriesForForm(),
    getArticleForAdmin(id),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          Upravit článek
        </h1>
        <p className="text-muted-foreground">
          Úprava sama o sobě neposílá newsletter odběratelům.
        </p>
      </div>
      <ArticleForm categories={categories} article={article} />
    </div>
  );
}
