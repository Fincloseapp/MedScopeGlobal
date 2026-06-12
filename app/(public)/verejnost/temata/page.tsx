import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import { VEREJNOST_HUB_TOPICS } from "@/lib/config/verejnost-topics";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Témata — Veřejné zdraví | MedScopeGlobal",
  description: "Kategorie veřejného zdraví — prevence, výživa, spánek, stres, ergonomie a další.",
};

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
          <FeatureCard
            key={t.slug}
            title={t.label}
            description={t.description}
            href={
              t.slug === "rozhovory"
                ? "/verejnost/rozhovory"
                : `/verejnost/clanky?topic=${t.backendTopic}`
            }
          />
        ))}
      </div>
    </ModulePageShell>
  );
}
