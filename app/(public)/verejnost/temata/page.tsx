import type { Metadata } from "next";
import { VerejnostTopicCard } from "@/components/verejnost/verejnost-topic-card";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { TEMATA_MAGAZINE_HUB } from "@/lib/portal/magazine-section-hub";
import { hubTopicListingHref, VEREJNOST_HUB_TOPICS } from "@/lib/config/verejnost-topics";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Témata — Veřejné zdraví | MedScopeGlobal",
    description: TEMATA_MAGAZINE_HUB.heroDeck,
    path: "/verejnost/temata",
  });
}

export default function VerejnostTemataPage() {
  const topics = VEREJNOST_HUB_TOPICS;

  return (
    <MagazineSectionHub config={TEMATA_MAGAZINE_HUB}>
      <section id="temata-grid" className="scroll-mt-24">
        <MagazineHubSectionHeader
          eyebrow="Katalog"
          title="Všechna témata veřejného zdraví"
          description="Vyberte oblast, která vás zajímá — každé téma obsahuje články srozumitelně pro širokou veřejnost."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <VerejnostTopicCard
              key={t.slug}
              slug={t.slug}
              label={t.label}
              description={t.description}
              href={hubTopicListingHref(t.slug, t.backendTopic)}
            />
          ))}
        </div>
      </section>
    </MagazineSectionHub>
  );
}
