import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMedicalAiCategories } from "@/lib/queries/v4d/medical-ai";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.desk.kategorie.metaTitle,
    description: copy.desk.kategorie.lead,
    path: "/odborne/kategorie",
    locale,
  });
}

export default async function OdborneKategoriePage() {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const page = copy.desk.kategorie;
  const categories = await getMedicalAiCategories();
  const grouped = categories.reduce<Record<string, typeof categories>>(
    (acc, c) => {
      (acc[c.category_type] ??= []).push(c);
      return acc;
    },
    {}
  );

  return (
    <ModulePageShell eyebrow={page.eyebrow} title={page.title} description={page.lead}>
      <Link href={localizePublicHref("/odborne", locale)} className="mb-6 inline-block text-sm text-[#005B96]">
        {copy.back}
      </Link>
      <div className="space-y-8">
        {Object.entries(grouped).map(([type, items]) => (
          <section key={type}>
            <h2 className="font-display text-lg font-bold text-[#021d33]">
              {copy.typeLabels[type] ?? type}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {items.map((c) => (
                <li key={c.id}>
                  <span className="rounded-full border border-[#8dc4ea] bg-white px-3 py-1 text-sm text-[#005B96]">
                    {c.label_cs}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ModulePageShell>
  );
}
