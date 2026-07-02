import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getUniversityNewsList } from "@/lib/queries/v4c/university-news";

export default async function Page() {
  const news = await getUniversityNewsList("vyzkum");
  return (
    <ModulePageShell eyebrow="Novinky" title="Výzkum" description="Výzkumné novinky a granty.">
      <div className="grid gap-4 sm:grid-cols-2">
        {news.map((n) => (
          <V4cContentCard key={n.id} href="/novinky" title={n.title} summary={n.summary} />
        ))}
      </div>
    </ModulePageShell>
  );
}
