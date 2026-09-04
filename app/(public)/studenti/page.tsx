import type { Metadata } from "next";
import Link from "next/link";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
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

  return (
    <div>
      <StudentOfferDashboard locale={locale} />
      <Link href={localizePublicHref("/studenti/klub", "cs")} className="sr-only">
        /studenti/klub
      </Link>
    </div>
  );
}
