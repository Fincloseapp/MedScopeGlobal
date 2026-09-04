import Link from "next/link";
import { getCzechFacultyOnlyCopy } from "@/lib/i18n/czech-faculty-only-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function CzechFacultyOnlyNotice({ locale }: { locale: string }) {
  const copy = getCzechFacultyOnlyCopy(locale);
  return (
    <div className="bg-[#F8F4EA]">
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C45C26]">
          {copy.kicker}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-[#0A192F] sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">{copy.lead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/cs/mediprep"
            className="rounded-full bg-[#C45C26] px-6 py-2.5 text-sm font-semibold text-white"
          >
            {copy.openCs}
          </Link>
          <Link
            href={localizePublicHref("/", locale)}
            className="rounded-full border border-[#0A192F]/20 px-6 py-2.5 text-sm font-semibold text-[#0A192F]"
          >
            {copy.backHome}
          </Link>
        </div>
      </section>
    </div>
  );
}
