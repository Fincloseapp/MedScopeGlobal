import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getArchivedStudies } from "@/lib/queries/v4c/studies";

export const metadata: Metadata = { title: "Archiv studií" };

export default async function StudieArchivPage() {
  const studies = await getArchivedStudies();
  return (
    <ModulePageShell eyebrow="Studie" title="Archiv studií" description="Starší publikované studie.">
      <div className="grid gap-4 sm:grid-cols-2">
        {studies.map((s) => (
          <V4cContentCard key={s.id} href={`/studie/${s.id}`} title={s.title} summary={s.summary ?? s.abstract} />
        ))}
      </div>
    </ModulePageShell>
  );
}
