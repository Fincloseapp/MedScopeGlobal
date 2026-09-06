import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getRecentCitations } from "@/lib/queries/v5plus/evidence";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.desk.citace.metaTitle,
    description: copy.desk.citace.lead,
    path: "/odborne/citace",
    locale,
  });
}

export default async function OdborneCitacePage() {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const page = copy.desk.citace;
  const citations = await getRecentCitations(30);

  return (
    <ModulePageShell eyebrow={page.eyebrow} title={page.title} description={page.lead}>
      <Link href={localizePublicHref("/odborne", locale)} className="mb-6 inline-block text-sm text-[#005B96]">
        {copy.back}
      </Link>
      <ul className="space-y-4">
        {citations.map((c) => (
          <li key={c.id} className="rounded-xl border border-[#cfe1f3] bg-white p-4 text-sm">
            <p className="text-xs font-semibold uppercase text-[#005B96]">{c.citation_format}</p>
            <p className="mt-2 text-slate-800">{c.citation_text}</p>
            {c.doi ? (
              <a
                href={`https://doi.org/${c.doi}`}
                className="mt-2 inline-block text-xs text-[#005B96]"
                target="_blank"
                rel="noopener noreferrer"
              >
                DOI →
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      {citations.length === 0 ? <p className="text-sm text-slate-600">{page.empty}</p> : null}
    </ModulePageShell>
  );
}
