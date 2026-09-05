import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";
import { getMedicalAiTextById } from "@/lib/queries/v4d/medical-ai";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const t = await getMedicalAiTextById(id);
  return { title: t?.title ?? copy.title };
}

export default async function OdborneDetailPage({ params }: Props) {
  const { id } = await params;
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const text = await getMedicalAiTextById(id);
  if (!text) notFound();

  const [sidebarAds, inlineAds] = await Promise.all([
    getActiveAdsByPlacement("diagnosis_sidebar", 2),
    getActiveAdsByPlacement("diagnosis_inline", 1),
  ]);

  return (
    <div className="bg-[#fafcff]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_260px]">
        <article>
          <Link href={localizePublicHref("/odborne", locale)} className="text-sm text-[#005B96]">
            {copy.back}
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-[#021d33]">{text.title}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {[text.source_name, text.specialty, text.original_language?.toUpperCase()]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <section className="mt-8 rounded-2xl border border-[#cfe1f3] bg-white p-6">
            <h2 className="font-semibold text-[#005B96]">{copy.clinicianSummary}</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{text.summary_clinician}</p>
          </section>

          <AdPlacement ads={inlineAds} variant="inline" />

          <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
            <h2 className="font-semibold text-emerald-900">{copy.patientSummary}</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{text.summary_patient}</p>
          </section>

          {text.content_cs ? (
            <div
              className="prose prose-slate mt-8 max-w-none"
              dangerouslySetInnerHTML={{ __html: text.content_cs }}
            />
          ) : null}

          {text.source_url ? (
            <a
              href={text.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block text-sm font-semibold text-[#005B96]"
            >
              {copy.sourceLink}
            </a>
          ) : null}

          {Object.keys(text.categories ?? {}).length > 0 ? (
            <div className="mt-8 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">{copy.aiCategories}</p>
              <pre className="mt-2 overflow-auto rounded bg-slate-50 p-3">
                {JSON.stringify(text.categories, null, 2)}
              </pre>
            </div>
          ) : null}
        </article>
        <AdPlacement ads={sidebarAds} variant="sidebar" />
      </div>
    </div>
  );
}
