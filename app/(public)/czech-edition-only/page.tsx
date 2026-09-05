import type { Metadata } from "next";
import { headers } from "next/headers";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import {
  getCzechFacultyOnlyCopy,
  type CzechFacultyProduct,
} from "@/lib/i18n/czech-faculty-only-copy";
import { CzechFacultyOnlyNotice } from "@/components/apps/czech-faculty-only";

export const dynamic = "force-dynamic";

function productFromHeader(raw: string | null): CzechFacultyProduct {
  if (raw === "academy" || raw === "mediprep" || raw === "students") return raw;
  return "academy";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const product = productFromHeader((await headers()).get("x-czech-faculty-product"));
  const copy = getCzechFacultyOnlyCopy(locale, product);
  return {
    ...(await buildLocalizedV20PageMetadata({
      title: copy.metaTitle,
      description: copy.metaDescription,
      path: "/czech-edition-only",
    })),
    robots: { index: false, follow: false },
  };
}

export default async function CzechEditionOnlyPage() {
  const locale = await getServerLocale();
  const product = productFromHeader((await headers()).get("x-czech-faculty-product"));
  return <CzechFacultyOnlyNotice locale={locale} product={product} />;
}
