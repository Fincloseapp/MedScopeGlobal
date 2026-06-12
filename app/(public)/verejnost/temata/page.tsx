import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { VerejnostTopicCard } from "@/components/verejnost/verejnost-topic-card";
import { VEREJNOST_HUB_TOPICS } from "@/lib/config/verejnost-topics";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Témata — Veřejné zdraví | MedScopeGlobal",
    description: "Kategorie veřejného zdraví — prevence, výživa, spánek, stres, ergonomie a další.",
    path: "/verejnost/temata",
  });
}

function topicHref(slug: string, backendTopic: string) {
  return slug === "rozhovory" ? "/verejnost/rozhovory" : `/verejnost/clanky?topic=${backendTopic}`;
}

export default function VerejnostTemataPage() {
  const topics = VEREJNOST_HUB_TOPICS;

  return (
    <ModulePageShell
      eyebrow="Veřejné zdraví"
      title="Témata"
      description="Vyberte oblast, která vás zajímá — každé téma obsahuje články srozumitelně pro širokou veřejnost."
      ctaHref="/verejnost/clanky"
      ctaLabel="Všechny články"
    >
      <Link href="/verejnost" className="mb-6 inline-block text-sm text-[#005B96] hover:underline">
        ← Zpět na přehled
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <VerejnostTopicCard
            key={t.slug}
            slug={t.slug}
            label={t.label}
            description={t.description}
            href={topicHref(t.slug, t.backendTopic)}
          />
        ))}
      </div>
    </ModulePageShell>
  );
}
