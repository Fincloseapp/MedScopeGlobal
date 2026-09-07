import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { NewsletterNewsstand } from "@/components/v23/newsletter-newsstand";
import { getNewsletterArchive } from "@/lib/queries/v4c/newsletters";
import { getV22LatestNewsletter } from "@/lib/v22/newsletter";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { getNewsletterStandCopy } from "@/lib/i18n/newsletter-stand-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export const revalidate = 3600;

export default async function NewsletterArchivPage() {
  const locale = await getServerLocale();
  const copy = getNewsletterCopy(locale);
  const stand = getNewsletterStandCopy(locale);
  const [archive, latest] = await Promise.all([
    getNewsletterArchive(false, locale),
    getV22LatestNewsletter(locale),
  ]);

  return (
    <ModulePageShell eyebrow={copy.hubEyebrow} title={stand.title} description={stand.lead} hideIntro>
      <NewsletterNewsstand archive={archive} latest={latest} locale={locale} />
      <Link
        href={localizePublicHref("/newsletter/posledni", locale)}
        className="mt-6 inline-block text-sm font-medium text-[#005B96] hover:underline"
      >
        {copy.hubLatest} →
      </Link>
    </ModulePageShell>
  );
}
