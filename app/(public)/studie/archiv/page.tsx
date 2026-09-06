import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V20StudyCard } from "@/components/v20/study-card";
import { getStudiesList } from "@/lib/queries/v4c/studies";
import { enrichStudy, isValidV20Study } from "@/lib/v20/studies/enrich";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getStudieHubCopy } from "@/lib/i18n/studie-hub-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getStudieHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.archiveMetaTitle,
    description: copy.archiveLead,
    path: "/studie/archiv",
    locale,
  });
}

export default async function StudieArchivPage() {
  const locale = await getServerLocale();
  const copy = getStudieHubCopy(locale);
  const rows = await getStudiesList({ archived: true, limit: 50 });
  const studies = rows.map(enrichStudy).filter(isValidV20Study);

  return (
    <ModulePageShell
      eyebrow={copy.archiveEyebrow}
      title={copy.archiveTitle}
      description={copy.archiveLead}
    >
      {studies.length === 0 ? (
        <p className="text-muted-foreground">{copy.archiveEmpty}</p>
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
