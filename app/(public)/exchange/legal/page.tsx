import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { listExchangeLegalDocs } from "@/lib/exchange/legal-docs";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: copy.legalHubTitle,
    description: copy.legalHubLead,
    path: "/exchange/legal",
    locale,
  });
}

export default async function ExchangeLegalHubPage() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const docs = listExchangeLegalDocs(locale);
  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.legalHubTitle} description={copy.legalHubLead}>
      <ul className="grid gap-3">
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link
              href={localizePublicHref(doc.href, locale)}
              className="block rounded-2xl border border-[#cfe1f3] bg-white px-5 py-4 hover:border-[#005B96]/40"
            >
              <span className="font-display text-lg font-semibold text-[#021d33]">{doc.title}</span>
              <span className="mt-1 block text-xs text-slate-500">v{doc.version}</span>
            </Link>
          </li>
        ))}
      </ul>
    </ModulePageShell>
  );
}
