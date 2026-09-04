import type { Metadata } from "next";
import { headers } from "next/headers";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import {
  czechFacultyProductForPath,
  getCzechFacultyOnlyCopy,
  isCzechFacultyLocale,
} from "@/lib/i18n/czech-faculty-only-copy";
import { CzechFacultyOnlyNotice } from "@/components/apps/czech-faculty-only";
import { PATHNAME_REQUEST_HEADER } from "@/lib/i18n/config";
import { resolveLocalePath } from "@/lib/i18n/locale-path";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const raw = (await headers()).get(PATHNAME_REQUEST_HEADER);
  const { pathname } = resolveLocalePath(raw || "/studenti/unknown");
  if (!isCzechFacultyLocale(locale) && (raw ? czechFacultyProductForPath(pathname) : "students")) {
    const copy = getCzechFacultyOnlyCopy(locale, "students");
    return {
      ...(await buildLocalizedV20PageMetadata({
        title: copy.metaTitle,
        description: copy.metaDescription,
        path: pathname || "/studenti",
      })),
      robots: { index: false, follow: false },
    };
  }
  return {};
}

export default async function StudentiLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const raw = (await headers()).get(PATHNAME_REQUEST_HEADER);
  const { pathname } = resolveLocalePath(raw || "/studenti/unknown");
  if (!isCzechFacultyLocale(locale) && (raw ? czechFacultyProductForPath(pathname) : "students")) {
    return <CzechFacultyOnlyNotice locale={locale} product="students" />;
  }
  return children;
}
