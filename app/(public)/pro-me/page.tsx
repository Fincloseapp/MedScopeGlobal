import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getProMeCopy } from "@/lib/i18n/pro-me-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getProMeCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.hubMetaTitle,
    description: copy.hubMetaDescription,
    path: "/pro-me",
    locale,
  });
}

export default async function ProMeHubPage() {
  const locale = await getServerLocale();
  const copy = getProMeCopy(locale);

  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.lead}
      homeHref={localizePublicHref("/", locale)}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(copy.audiences).map(([key, item]) => (
          <Link
            key={key}
            href={localizePublicHref(item.href, locale)}
            className="rounded-xl border border-[#d9e8f4] bg-white p-6 shadow-sm transition hover:border-[#005B96]"
          >
            <h2 className="text-lg font-semibold text-[#005B96]">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <p className="mt-3 text-sm font-semibold text-[#005B96]">{copy.openFeed}</p>
          </Link>
        ))}
      </div>
    </ModulePageShell>
  );
}
