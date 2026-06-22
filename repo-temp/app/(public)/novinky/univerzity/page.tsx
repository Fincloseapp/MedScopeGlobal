import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getUniversityNewsList } from "@/lib/queries/v4c/university-news";

export default async function Page() {
  const news = await getUniversityNewsList("univerzity");
  return (
    <ModulePageShell eyebrow="Novinky" title="Univerzity" description="Novinky z českých a zahraničních LF.">
      <div className="grid gap-4 sm:grid-cols-2">
        {news.map((n) => (
          <V4cContentCard key={n.id} href={`/novinky/univerzity/${n.slug}`} title={n.title} meta={n.university ?? undefined} summary={n.summary} />
        ))}
      </div>
    </ModulePageShell>
  );
}
