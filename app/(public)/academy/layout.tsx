import type { Metadata } from "next";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getCzechFacultyOnlyCopy, isCzechFacultyLocale } from "@/lib/i18n/czech-faculty-only-copy";
import { CzechFacultyOnlyNotice } from "@/components/apps/czech-faculty-only";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  if (!isCzechFacultyLocale(locale)) {
    const copy = getCzechFacultyOnlyCopy(locale, "academy");
    return {
      ...(await buildLocalizedV20PageMetadata({
        title: copy.metaTitle,
        description: copy.metaDescription,
        path: "/academy",
      })),
      robots: { index: false, follow: false },
    };
  }
  return await buildLocalizedV20PageMetadata({
    title: "MedScope Academy — vzdělávání v medicíně",
    description:
      "Interaktivní kurzy, lekce a kvízy pro studenty medicíny a lékaře. Gamifikace, certifikáty a AI generovaný obsah.",
    path: "/academy",
  });
}

export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  if (!isCzechFacultyLocale(locale)) {
    return (
      <div className="academy-v40 min-h-full bg-[#fafcff]">
        <CzechFacultyOnlyNotice locale={locale} product="academy" />
      </div>
    );
  }
  return <div className="academy-v40 min-h-full bg-[#fafcff]">{children}</div>;
}
