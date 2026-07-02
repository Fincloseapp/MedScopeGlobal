import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V20StudyCard } from "@/components/v20/study-card";
import { getStudiesList } from "@/lib/queries/v4c/studies";
import { enrichStudy, isValidV20Study } from "@/lib/v20/studies/enrich";

export const metadata: Metadata = { title: "Archiv studií" };

export const revalidate = 120;

export default async function StudieArchivPage() {
  const rows = await getStudiesList({ archived: true, limit: 50 });
  const studies = rows.map(enrichStudy).filter(isValidV20Study);

  return (
    <ModulePageShell
      eyebrow="Studie"
      title="Archiv studií"
      description="Starší publikované studie s českým shrnutím a metadaty."
    >
      {studies.length === 0 ? (
        <p className="text-muted-foreground">V archivu zatím nejsou žádné studie.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((s) => (
            <V20StudyCard key={s.id} study={s} />
          ))}
        </div>
      )}
    </ModulePageShell>
  );
}
