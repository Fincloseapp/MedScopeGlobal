import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMedicalSources } from "@/lib/queries/v5plus/evidence";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.desk.zdroje.metaTitle,
    description: copy.desk.zdroje.lead,
    path: "/odborne/zdroje",
    locale,
  });
}

export default async function OdborneZdrojePage() {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const page = copy.desk.zdroje;
  const sources = await getMedicalSources(40);

  return (
    <ModulePageShell eyebrow={page.eyebrow} title={page.title} description={page.lead}>
      <Link href={localizePublicHref("/odborne", locale)} className="mb-6 inline-block text-sm text-[#005B96]">
        {copy.back}
      </Link>
      <div className="space-y-3">
        {sources.map((s) => (
          <article key={s.id} className="rounded-xl border border-[#cfe1f3] bg-white p-4 text-sm">
            <p className="text-xs font-semibold uppercase text-[#005B96]">
              {s.source_type}
              {s.validated ? ` · ${copy.validated}` : ""}
            </p>
            <h2 className="mt-1 font-semibold text-[#021d33]">{s.title}</h2>
            <p className="mt-1 text-slate-500">{[s.authors, s.journal, s.year].filter(Boolean).join(" · ")}</p>
            {s.doi ? (
              <a
                href={`https://doi.org/${s.doi}`}
                className="mt-2 inline-block text-xs text-[#005B96]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.doi}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </ModulePageShell>
  );
}
