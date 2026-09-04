import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { isCzechFacultyLocale } from "@/lib/i18n/czech-faculty-only-copy";
import { StudentOfferDashboard } from "@/components/studenti/student-offer-dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).students;
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/studenti",
    locale,
  });
}

export default async function StudentiHubPage() {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).students;
  const cs = isCzechFacultyLocale(locale);
  const h = (path: string) => localizePublicHref(path, locale);
  const rooms = [
    {
      href: "/studenti/klub",
      title: cs ? "Klub kvízů B/C/F" : "B/C/F quiz club",
      body: cs
        ? "Osm otázek z banky přijímaček. Na tabuli jen přezdívka."
        : "Eight admissions questions. Nickname on the board only.",
    },
    ...copy.more,
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <StudentOfferDashboard locale={locale} />

      <section className="rounded-[2rem] border border-[#cfe1f3] bg-[#f4f8fc] px-5 py-7 sm:px-8">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
          <Gift className="h-4 w-4" aria-hidden />
          {copy.parentsEyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-[#021d33]">{copy.parentsTitle}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{copy.parentsBody}</p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {copy.parentBullets.map((item) => (
            <li key={item} className="text-sm text-slate-700">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={h("/studenti/darkove")}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#005B96] px-5 text-sm font-semibold text-white"
          >
            {copy.giftTrial}
          </Link>
          <Link
            href={h("/predplatne#student")}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#005B96]/30 bg-white px-5 text-sm font-semibold text-[#005B96]"
          >
            {copy.studentPlan}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.moreTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{copy.moreLead}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {rooms.map((item) => (
            <Link
              key={item.href}
              href={item.href === "/studenti/klub" ? localizePublicHref("/studenti/klub", "cs") : h(item.href)}
              className="rounded-2xl border border-[#d9e8f4] bg-white px-5 py-5 no-underline transition hover:border-[#005B96]/40"
            >
              <strong className="font-display text-lg text-[#021d33]">{item.title}</strong>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
