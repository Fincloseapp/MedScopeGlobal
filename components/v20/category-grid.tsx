import Link from "next/link";
import type { V20CategoryWithCount } from "@/lib/v20/categories";

export function V20CategoryGrid({ categories }: { categories: V20CategoryWithCount[] }) {
  if (!categories.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Kategorie se načítají — žádná prázdná sekce není zobrazena.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="v20-category-card group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold text-[#021d33] group-hover:text-primary">
                    {cat.name}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {cat.count}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{cat.description}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
