import type { Metadata } from "next";
import { V20CategoryGrid } from "@/components/v20/category-grid";
import { getV20CategoriesWithCounts } from "@/lib/queries/categories";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Odborné obory — MedScopeGlobal",
    description:
      "Přehled medicínských specializací podle NZIP registrů. Profesionální kategorie s popisy v češtině.",
    path: "/categories",
  });
}

export default async function CategoriesPage() {
  const categories = await getV20CategoriesWithCounts("cs");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        NZIP topic registry
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">Odborné obory</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Kategorie jsou sjednocené podle NZIP registrů. Prázdné a duplicitní sekce jsou skryté.
        Každá kategorie obsahuje profesionální popis v češtině.
      </p>
      <div className="mt-10">
        <V20CategoryGrid categories={categories} />
      </div>
    </div>
  );
}
