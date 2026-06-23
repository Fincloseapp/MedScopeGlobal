import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getStudiesList } from "@/lib/queries/v4c/studies";

export const metadata: Metadata = { title: "Nejnovější studie" };

export default async function StudieNejnovejsiPage() {
  const studies = await getStudiesList({ limit: 24 });
  return (
    <ModulePageShell eyebrow="Studie" title="Nejnovější studie" description="Chronologický přehled publikovaných studií.">
      <div className="grid gap-4 sm:grid-cols-2">
        {studies.map((s) => (
          <V4cContentCard key={s.id} href={`/studie/${s.id}`} title={s.title} summary={s.summary ?? s.abstract} meta={s.published_date ?? undefined} />
        ))}
      </div>
    </ModulePageShell>
  );
}
