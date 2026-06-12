import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Rozhovory — Veřejné zdraví | MedScopeGlobal",
    description: "Rozhovory s lékaři a odborníky pro širokou veřejnost.",
    path: "/verejnost/rozhovory",
  });
}

export default async function VerejnostRozhovoryPage() {
  const interviews = await listPublicArticles({ topic: "rozhovory", limit: 24, ensureContent: true });

  return (
    <ModulePageShell
      eyebrow="Veřejné zdraví"
      title="Rozhovory"
      description="Rozhovory s lékaři, psychology a odborníky na prevenci — srozumitelně a bez žargonu."
      ctaHref="/verejnost"
      ctaLabel="Hub veřejné zdraví"
    >
      <Link href="/verejnost" className="mb-6 inline-block text-sm text-[#005B96] hover:underline">
        ← Zpět na přehled
      </Link>

      {interviews.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interviews.map((item) => (
            <VerejnostArticleCard key={item.id} article={item} variant="interview" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          <p>Rozhovory s odborníky se připravují — brzy na medscopeglobal.com.</p>
          <Link href="/verejnost/clanky" className="mt-4 inline-block text-[#005B96] hover:underline">
            Prohlédnout články →
          </Link>
        </div>
      )}
    </ModulePageShell>
  );
}
