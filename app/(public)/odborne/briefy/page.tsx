import type { Metadata } from "next";
import Link from "next/link";
import { V19ArticleBriefFeedLazy } from "@/components/v19/article-brief-feed";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { isCzechSurface } from "@/lib/i18n/surface-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.briefyMetaTitle,
    description: copy.briefyMetaDescription,
    path: "/odborne/briefy",
    locale,
  });
}

export default async function OdborneBriefyPage() {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const czech = isCzechSurface(locale);

  return (
    <div className="v20-briefy">
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/80">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            {copy.briefyEyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33] sm:text-4xl">
            {copy.briefyTitle}
          </h1>
          <p className="mt-3 text-slate-600">{copy.briefyLead}</p>
          {!czech ? (
            <p className="mt-4 text-sm text-slate-600">
              {copy.briefyCsOnly}{" "}
              <Link href="/cs/odborne/briefy" className="font-semibold text-[#005B96] hover:underline">
                {copy.openCsBriefs}
              </Link>
            </p>
          ) : null}
        </div>
      </section>
      {czech ? <V19ArticleBriefFeedLazy title={copy.briefyFeedTitle} limit={8} locale="cs" /> : null}
    </div>
  );
}
