import type { Metadata } from "next";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getCzechFacultyOnlyCopy, isCzechFacultyLocale } from "@/lib/i18n/czech-faculty-only-copy";
import { CzechFacultyOnlyNotice } from "@/components/apps/czech-faculty-only";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  if (!isCzechFacultyLocale(locale)) {
    const copy = getCzechFacultyOnlyCopy(locale, "students");
    return {
      ...(await buildLocalizedV20PageMetadata({
        title: copy.metaTitle,
        description: copy.metaDescription,
        path: "/medicina",
      })),
      robots: { index: false, follow: false },
    };
  }
  return {};
}

export default async function MedicinaLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  if (!isCzechFacultyLocale(locale)) {
    return <CzechFacultyOnlyNotice locale={locale} product="students" csHref="/cs/medicina" />;
  }
  return children;
}
