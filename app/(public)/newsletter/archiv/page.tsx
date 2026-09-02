import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getNewsletterArchive } from "@/lib/queries/v4c/newsletters";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export const revalidate = 3600;

export default async function NewsletterArchivPage() {
  const locale = await getServerLocale();
  const copy = getNewsletterCopy(locale);
  const issues = await getNewsletterArchive(false);

  return (
    <ModulePageShell
      eyebrow={copy.hubEyebrow}
      title={copy.hubArchive}
      description={copy.hubDescription}
    >
      <ul className="space-y-3">
        {issues.length === 0 ? (
          <li className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
            {copy.hubDescription}
          </li>
        ) : (
          issues.map((i) => (
            <li key={i.id}>
              <Link
                href={localizePublicHref(`/newsletter/${i.slug}`, locale)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-sky-200 hover:shadow-sm"
              >
                <span className="font-semibold text-[#021d33]">{i.title}</span>
                <time className="text-slate-500" dateTime={i.issue_date}>
                  {formatPublicDate(i.issue_date, locale)}
                </time>
              </Link>
            </li>
          ))
        )}
      </ul>
      <div className="mt-8">
        <ListingAffiliateBox locale={locale as GlobalLocaleCode} />
      </div>
      <Link href={localizePublicHref("/newsletter", locale)} className="mt-6 inline-block text-sm text-[#005B96] hover:underline">
        ← {copy.hubTitle}
      </Link>
    </ModulePageShell>
  );
}
