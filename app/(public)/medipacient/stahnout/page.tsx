import type { Metadata } from "next";
import Link from "next/link";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { MEDIPACIENT } from "@/lib/apps/catalog";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getMedipacientCopy } from "@/lib/i18n/medipacient-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMedipacientCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.downloadCta,
    description: copy.downloadPageLead,
    path: MEDIPACIENT.downloadPath,
  });
}

export default async function MedipacientDownloadPage() {
  const locale = await getServerLocale();
  const copy = getMedipacientCopy(locale);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#2D7FF9]">
        {copy.downloadPageKicker}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">{copy.downloadPageTitle}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{copy.downloadPageLead}</p>
      <div className="mt-8">
        <AppDownloadPanel app={MEDIPACIENT} locale={locale} />
      </div>
      <p className="mt-6 text-sm">
        <Link
          href={localizePublicHref(MEDIPACIENT.marketingPath, locale)}
          className="text-[#2D7FF9] hover:underline"
        >
          {copy.downloadPageBack}
        </Link>
      </p>
    </div>
  );
}
