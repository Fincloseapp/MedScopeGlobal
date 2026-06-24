import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getLegislationList } from "@/lib/queries/v4c/legislation";

const CATEGORY_LABELS: Record<string, string> = {
  zakony: "Zákony",
  vyhlasky: "Vyhlášky",
  metodiky: "Metodiky",
  drg: "DRG",
  kody: "Kódy",
  uhrady: "Úhrady",
  novinky: "Novinky",
};

export async function LegislationCategoryPage({
  category,
  title,
  description,
}: {
  category: string;
  title: string;
  description: string;
}) {
  const items = await getLegislationList(category);

  return (
    <ModulePageShell
      eyebrow="Legislativa"
      title={title}
      description={description}
      ctaHref="/legislativa/ai"
      ctaLabel="AI legislativa"
    >
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={key === "novinky" ? "/legislativa/novinky" : `/legislativa/${key}`}
            className={`rounded-full px-3 py-1 ${key === category ? "bg-[#005B96] text-white" : "border border-[#8dc4ea] text-[#005B96]"}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.length === 0 ? (
          <p className="text-sm text-slate-600 col-span-2">
            Zatím žádné položky. Spusťte denní ingest: <code>/api/cron/v4c-daily</code>
          </p>
        ) : (
          items.map((item) => (
            <V4cContentCard
              key={item.id}
              href={`/legislativa/novinky#${item.slug}`}
              title={item.title}
              meta={`${item.source} · ${item.published_date ?? ""}`}
              summary={item.summary}
              badge={CATEGORY_LABELS[item.category] ?? item.category}
            />
          ))
        )}
      </div>
      <Link href="/legislativa" className="mt-8 inline-block text-sm text-[#005B96]">
        ← Legislativa
      </Link>
    </ModulePageShell>
  );
}
