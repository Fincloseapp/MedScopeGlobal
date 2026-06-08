import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getLegislationList } from "@/lib/queries/v4c/legislation";
import { LEGISLATION_SOURCES } from "@/lib/v4c/sources";

export const metadata: Metadata = {
  title: "Legislativa",
  description: "MZČR, SÚKL, ÚZIS, EU a sbírka zákonů.",
};

const LINKS = [
  { href: "/legislativa/zakony", label: "Zákony" },
  { href: "/legislativa/vyhlasky", label: "Vyhlášky" },
  { href: "/legislativa/metodiky", label: "Metodiky" },
  { href: "/legislativa/drg", label: "DRG" },
  { href: "/legislativa/kody", label: "Kódy" },
  { href: "/legislativa/uhrady", label: "Úhrady" },
  { href: "/legislativa/novinky", label: "Novinky" },
];

export default async function LegislatiavaPage() {
  const latest = await getLegislationList(undefined, 8);

  return (
    <ModulePageShell
      eyebrow="Legislativa"
      title="Legislativa a regulace"
      description="Automatický monitoring MZČR, SÚKL, ÚZIS, EU AI Act a souvisejících metodik."
      ctaHref="/legislativa/ai"
      ctaLabel="AI legislativa"
    >
      <div className="flex flex-wrap gap-2 mb-8">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full border border-[#8dc4ea] px-3 py-1 text-sm text-[#005B96]">
            {l.label}
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {latest.map((item) => (
          <V4cContentCard key={item.id} href={`/legislativa/${item.slug}`} title={item.title} meta={item.source} summary={item.summary} badge={item.category} />
        ))}
      </div>
      <p className="mt-8 text-xs text-slate-500">{LEGISLATION_SOURCES.map((s) => s.name).join(" · ")}</p>
    </ModulePageShell>
  );
}
