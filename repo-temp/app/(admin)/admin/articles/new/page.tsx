import { ArticleForm } from "@/components/admin/article-form";
import { getCategories } from "@/lib/queries/categories";

export default async function NewArticlePage() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border bg-amber-50 p-6 text-sm text-amber-900">
        Create at least one category before drafting articles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          New article
        </h1>
        <p className="text-muted-foreground">
          Compose clinical-grade reporting with structured metadata.
        </p>
      </div>
      <ArticleForm categories={categories} />
    </div>
  );
}
