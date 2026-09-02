import Link from "next/link";
import { ArticleForm } from "@/components/admin/article-form";
import { loadAdminCategoriesForForm } from "@/lib/admin/overview";

export default async function NewArticlePage() {
  const categories = await loadAdminCategoriesForForm();

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border bg-amber-50 p-6 text-sm text-amber-900">
        Nejdřív založte kategorii.{" "}
        <Link href="/admin/categories" className="font-medium underline">
          Otevřít kategorie
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          Nový článek
        </h1>
        <p className="text-muted-foreground">
          Zařaďte článek do desk nebo lékařského oboru.
        </p>
      </div>
      <ArticleForm categories={categories} />
    </div>
  );
}
