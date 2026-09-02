import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  deleteCategory,
  saveCategory,
  syncEditorialCategories,
} from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadAdminCategoryRows } from "@/lib/admin/overview";
import {
  categoryHealthLabel,
  categoryKindLabel,
  missingEditorialSlugs,
  SPECIALTY_TO_DESK,
} from "@/lib/admin/taxonomy";

export const dynamic = "force-dynamic";

async function createCategory(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "");
  if (!name.trim()) return;
  await saveCategory({
    name,
    slug: String(formData.get("slug") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || null,
  });
}

async function updateCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await saveCategory({
    id,
    name: String(formData.get("name")),
    slug: String(formData.get("slug") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || null,
  });
}

async function removeCategory(formData: FormData) {
  "use server";
  await deleteCategory(String(formData.get("id")));
}

async function syncTaxonomy() {
  "use server";
  await syncEditorialCategories();
}

function healthClass(published: number): string {
  return published > 0
    ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
    : "rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800";
}

export default async function AdminCategoriesPage() {
  const categories = await loadAdminCategoryRows();
  const missing = missingEditorialSlugs(categories.map((row) => row.slug));
  const desks = categories.filter((row) => categoryKindLabel(row.slug) === "Redakční desk");
  const specialties = categories.filter((row) => categoryKindLabel(row.slug) === "Lékařský obor");
  const custom = categories.filter((row) => categoryKindLabel(row.slug) === "Vlastní");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            Taxonomie
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-medical-navy">
            Kategorie
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Redakční desky (NZIP + Dlouhověkost) a lékařské obory. Smazat lze jen prázdnou
            kategorii — články se nepřesouvají samy.
          </p>
        </div>
        <form action={syncTaxonomy}>
          <Button type="submit" variant="secondary">
            Doplnit a sjednotit názvy
          </Button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Desky</p>
          <p className="text-2xl font-bold">{desks.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Lékařské obory</p>
          <p className="text-2xl font-bold">{specialties.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Vlastní</p>
          <p className="text-2xl font-bold">{custom.length}</p>
        </div>
      </div>

      {missing.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">V databázi chybí {missing.length} kanonických kategorií.</p>
          <p className="mt-1 text-amber-800">{missing.join(", ")}</p>
          <p className="mt-1">
            Chybějící řádky se doplní při otevření této stránky. Tlačítko nahoře sjednotí české
            názvy a nic použitého nesmaže.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Kanonická taxonomie je kompletní. Názvy se při synchronizaci drží v češtině.
        </p>
      )}

      <form
        action={createCategory}
        className="grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Nová kategorie
          </label>
          <Input id="name" name="name" required placeholder="např. Endokrinologie" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="slug">
            Slug (volitelně)
          </label>
          <Input id="slug" name="slug" placeholder="endokrinologie" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Popis
          </label>
          <Input
            id="description"
            name="description"
            placeholder="Krátké SEO shrnutí pro /category/…"
          />
        </div>
        <div className="md:col-span-4">
          <Button type="submit">Přidat kategorii</Button>
        </div>
      </form>

      <CategoryTable
        title="Redakční desky"
        hint="To, co čtenář potká v magazínu. Prázdný desk na webu vrací 404."
        rows={desks}
      />
      <CategoryTable
        title="Lékařské obory"
        hint="Anglické slugy (cardiology…) zůstávají kvůli starším článkům. Název je český."
        rows={specialties}
      />
      <CategoryTable
        title="Vlastní kategorie"
        hint="Ručně založené. Smazat lze jen když u nich nejsou články."
        rows={custom}
      />
    </div>
  );
}

function CategoryTable({
  title,
  hint,
  rows,
}: {
  title: string;
  hint: string;
  rows: Awaited<ReturnType<typeof loadAdminCategoryRows>>;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{title}</h2>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Zatím prázdné.</p>
        ) : (
          <div className="divide-y">
            {rows.map((category) => {
              const alias = SPECIALTY_TO_DESK[category.slug];
              const used = category.published + category.drafts > 0;
              return (
                <div key={category.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
                  <form action={updateCategory} className="grid gap-3 md:grid-cols-3">
                    <input type="hidden" name="id" value={category.id} />
                    <div className="space-y-2">
                      <Input name="name" defaultValue={category.name} required />
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className={healthClass(category.published)}>
                          {categoryHealthLabel(category.health)}
                        </span>
                        <span className="text-slate-500">{categoryKindLabel(category.slug)}</span>
                        {alias ? (
                          <span className="text-slate-500">desk {alias}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Input name="slug" defaultValue={category.slug} />
                      <p className="text-[11px] text-slate-500">
                        {category.published} publikováno · {category.drafts} konceptů
                      </p>
                    </div>
                    <Input
                      name="description"
                      defaultValue={category.description ?? ""}
                      placeholder="Popis"
                    />
                    <div className="flex flex-wrap items-center gap-2 md:col-span-3">
                      <Button type="submit" size="sm" variant="secondary">
                        Uložit
                      </Button>
                      {category.published > 0 ? (
                        <Link
                          href={`/category/${category.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#005B96] hover:underline"
                          target="_blank"
                        >
                          Veřejná stránka
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Na webu zatím 404</span>
                      )}
                    </div>
                  </form>
                  <form action={removeCategory} className="flex items-start justify-end">
                    <input type="hidden" name="id" value={category.id} />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      disabled={used}
                      title={used ? "Nejdřív přesuňte články" : "Smazat prázdnou kategorii"}
                    >
                      Smazat
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
