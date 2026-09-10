import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { listExchangeContent } from "@/lib/exchange/catalog";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: copy.contentTitle,
    description: copy.contentLead,
    path: "/exchange/content",
    locale,
  });
}

export default async function ExchangeContentPage() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const items = listExchangeContent(locale);

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.contentTitle} description={copy.contentLead}>
      <ul className="grid gap-4">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">{item.kind}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.excerpt}</p>
            {item.subscriptionRequired ? (
              <p className="mt-3 text-sm text-amber-800">{copy.locked}</p>
            ) : (
              <Link href={localizePublicHref(item.href, locale)} className="mt-3 inline-block text-sm font-semibold text-[#005B96]">
                {item.title} →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </ModulePageShell>
  );
}
