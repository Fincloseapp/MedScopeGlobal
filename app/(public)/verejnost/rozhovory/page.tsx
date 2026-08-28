import type { Metadata } from "next";
import Link from "next/link";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { ROZHOVORY_MAGAZINE_HUB } from "@/lib/portal/magazine-section-hub";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Rozhovory — Veřejné zdraví | MedScopeGlobal",
    description: ROZHOVORY_MAGAZINE_HUB.heroDeck,
    path: "/verejnost/rozhovory",
  });
}

export default async function VerejnostRozhovoryPage() {
  const interviews = await listPublicArticles({ topic: "rozhovory", limit: 24, ensureContent: true });

  return (
    <MagazineSectionHub config={ROZHOVORY_MAGAZINE_HUB}>
      <section id="rozhovory-grid" className="scroll-mt-24">
        <MagazineHubSectionHeader
          eyebrow="Rozhovory"
          title="Rozhovory s odborníky"
          description="Lékaři, psychologové a specialisté vysvětlují prevenci a zdraví srozumitelně — bez žargonu."
        />
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
      </section>
    </MagazineSectionHub>
  );
}
