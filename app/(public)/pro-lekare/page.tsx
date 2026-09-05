import type { Metadata } from "next";
import Link from "next/link";
import { V27AudienceHub } from "@/components/v27/audience-hub-section";
import { getPhysicianLandingCopy } from "@/lib/i18n/physician-landing-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getPhysicianLandingCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/pro-lekare",
  });
}

export default async function ProLekarePage() {
  const locale = await getServerLocale();
  const copy = getPhysicianLandingCopy(locale);
  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <V27AudienceHub audience="physician" variant="hero" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {copy.eyebrow}
          </p>
          <h2 className="font-display text-2xl font-bold text-[#021d33]">{copy.sectionsTitle}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {copy.sections.map((s) => (
            <Link
              key={s.href}
              href={localizePublicHref(s.href, locale)}
              prefetch
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40 hover:shadow-sm"
            >
              <p className="font-semibold text-[#021d33]">{s.label}</p>
              <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
            </Link>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-950">{copy.verifyTitle}</h3>
          <p className="mt-2 text-sm text-amber-900">
            {copy.verifyBody}
            {copy.verifyAdminHref && copy.verifyAdminLabel ? (
              <>
                {" "}
                <Link href={copy.verifyAdminHref} className="underline">
                  {copy.verifyAdminLabel}
                </Link>
                .
              </>
            ) : null}
          </p>
        </section>
      </div>
    </div>
  );
}
