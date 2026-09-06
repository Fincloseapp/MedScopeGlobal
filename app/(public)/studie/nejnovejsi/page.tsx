import type { Metadata } from "next";
import { V20StudyCard } from "@/components/v20/study-card";
import { getV20StudiesList } from "@/lib/v20/studies/query";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getStudieHubCopy } from "@/lib/i18n/studie-hub-copy";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getStudieHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.latestMetaTitle,
    description: copy.latestMetaDescription,
    path: "/studie/nejnovejsi",
    locale,
  });
}

export default async function StudieNejnovejsiPage() {
  const locale = await getServerLocale();
  const copy = getStudieHubCopy(locale);
  const studies = await getV20StudiesList(24);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-[#021d33]">{copy.latestTitle}</h1>
      <p className="mt-2 text-slate-600">{copy.latestLead}</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {studies.map((s) => (
          <V20StudyCard key={s.id} study={s} />
        ))}
      </div>
    </div>
  );
}
