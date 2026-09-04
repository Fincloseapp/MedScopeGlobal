import type { Metadata } from "next";
import Link from "next/link";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { MEDIFLOW } from "@/lib/apps/catalog";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getMediflowCopy } from "@/lib/i18n/mediflow-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMediflowCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.downloadPageKicker,
    description: copy.downloadPageLead,
    path: MEDIFLOW.downloadPath,
  });
}

export default async function MediFlowDownloadPage() {
  const locale = await getServerLocale();
  const copy = getMediflowCopy(locale);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-600">
        {copy.downloadPageKicker}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-[#0a1628]">{copy.downloadPageTitle}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{copy.downloadPageLead}</p>
      <ol className="mt-6 space-y-2 text-sm text-slate-700">
        {copy.downloadPageSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="mt-8">
        <AppDownloadPanel app={MEDIFLOW} locale={locale} />
      </div>
      <p className="mt-6 text-sm">
        <Link
          href={localizePublicHref(MEDIFLOW.marketingPath, locale)}
          className="text-emerald-700 hover:underline"
        >
          {copy.downloadPageBack}
        </Link>
      </p>
    </div>
  );
}
