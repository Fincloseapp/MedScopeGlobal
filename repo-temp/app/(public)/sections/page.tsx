import type { Metadata } from "next";
import Link from "next/link";
import { SectionsOverview } from "@/components/platform/sections-overview";
import { AccessLevelsOverview } from "@/components/platform/access-levels-overview";
import { normalizeLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { cookies } from "next/headers";
import type { AccessLevelId, ContentAccessLevel } from "@/lib/config/access-levels";
import { contentTypesForAccessLevel } from "@/lib/config/medical-sections";
import { MEDICAL_SECTIONS } from "@/lib/config/medical-sections";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  return {
    title: t(dict, "sections.title"),
    description: t(dict, "sections.clinicalMedicineDesc"),
  };
}

type SectionFilter = "public" | "student" | "physician";

type Props = { searchParams: Promise<{ level?: string }> };

export default async function SectionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  const level: SectionFilter | null = (
    ["public", "student", "physician"] as const
  ).includes(sp.level as SectionFilter)
    ? (sp.level as SectionFilter)
    : null;

  const accessForContent: ContentAccessLevel | null =
    level === "student" ? "student" : level;

  const allowedTypes = accessForContent
    ? contentTypesForAccessLevel(accessForContent)
    : null;
  const sections = level
    ? MEDICAL_SECTIONS.filter((s) =>
        s.contentTypeSlugs.some((slug) =>
          allowedTypes?.some((t) => t.slug === slug)
        )
      )
    : MEDICAL_SECTIONS;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t(dict, "nav.home")}
        </Link>
        <span className="mx-2">/</span>
        <span>{t(dict, "nav.sections", "Sekce")}</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold text-[#005B96]">
        {t(dict, "sections.title")}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {t(dict, "alerts.localeArticles")}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/sections"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            !level ? "bg-[#005B96] text-white" : "bg-white hover:bg-muted"
          }`}
        >
          {t(dict, "nav.sections")}
        </Link>
        <Link
          href="/sections?level=public"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            level === "public" ? "bg-[#005B96] text-white" : "bg-white hover:bg-muted"
          }`}
        >
          {t(dict, "access.public")}
        </Link>
        <Link
          href="/sections?level=student"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            level === "student" ? "bg-[#005B96] text-white" : "bg-white hover:bg-muted"
          }`}
        >
          {t(dict, "access.student")}
        </Link>
        <Link
          href="/sections?level=physician"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            level === "physician" ? "bg-[#005B96] text-white" : "bg-white hover:bg-muted"
          }`}
        >
          {t(dict, "access.physician")}
        </Link>
        <Link
          href="/access-levels"
          className="rounded-full border border-[#005B96]/30 px-4 py-1.5 text-sm font-medium text-[#005B96] hover:bg-[#C7E3FF]/40"
        >
          {t(dict, "nav.access")} →
        </Link>
      </div>

      <div className="mt-10">
        {level ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/sections/${s.slug}`}
                  className="block rounded-xl border bg-card p-5 shadow-sm hover:border-[#005B96]/40"
                >
                  <h3 className="font-display font-semibold text-[#005B96]">
                    {t(dict, s.nameKey)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(dict, s.descriptionKey)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <SectionsOverview locale={locale} />
        )}
      </div>

      <section className="mt-16 border-t pt-12">
        <h2 className="font-display text-2xl font-semibold text-[#005B96]">
          {t(dict, "nav.access")}
        </h2>
        <div className="mt-6">
          <AccessLevelsOverview locale={locale} compact />
        </div>
      </section>
    </div>
  );
}
