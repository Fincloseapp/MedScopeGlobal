import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getDigitalHealthList } from "@/lib/queries/v4c/digital-health";
import { DIGITAL_HEALTH_TOPICS } from "@/lib/v4c/sources";

export const metadata: Metadata = {
  title: "Digital Health",
  description: "Sloučené eHealth a AI Health — telemedicína, wearables, regulace.",
};

export default async function DigitalHealthPage() {
  const items = await getDigitalHealthList(12);

  return (
    <ModulePageShell
      eyebrow="Digital Health"
      title="Digital Health"
      description="eHealth + AI Health: telemedicína, wearables, AI diagnostika, legislativa AI, SÚKL SW jako ZP."
      ctaHref="/digital-health/ai-asistent"
      ctaLabel="AI asistent"
    >
      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        <Link href="/digital-health/novinky" className="rounded-full bg-[#005B96] px-3 py-1 text-white">Novinky</Link>
        <Link href="/digital-health/legislativa" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">Legislativa</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <V4cContentCard key={item.id} href={`/digital-health/novinky#${item.slug}`} title={item.title} summary={item.summary} badge={item.topic ?? undefined} />
        ))}
      </div>
      <p className="mt-8 text-xs text-slate-500">{DIGITAL_HEALTH_TOPICS.join(" · ")}</p>
    </ModulePageShell>
  );
}
