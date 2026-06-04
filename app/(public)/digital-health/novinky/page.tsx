import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getDigitalHealthList } from "@/lib/queries/v4c/digital-health";

export default async function DhNovinkyPage() {
  const items = await getDigitalHealthList();
  return (
    <ModulePageShell eyebrow="Digital Health" title="Novinky" description="Telemedicína, wearables, AI diagnostika.">
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((i) => (
          <V4cContentCard key={i.id} href="/digital-health" title={i.title} summary={i.summary} meta={i.published_date ?? undefined} />
        ))}
      </div>
    </ModulePageShell>
  );
}
