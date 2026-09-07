import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { SITE } from "@/lib/config/site";
import { attributionUrl, getAiAgentBrief } from "@/lib/growth/ai-agent-program";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const brief = getAiAgentBrief(locale);
  return await buildLocalizedPageMetadata({
    title: brief.pageTitle,
    description: brief.pageLead,
    path: "/pro-ai",
    locale,
  });
}

export default async function ProAiPage() {
  const locale = await getServerLocale();
  const brief = getAiAgentBrief(locale);
  const h = (path: string) => localizePublicHref(path, locale);

  return (
    <ModulePageShell
      eyebrow={brief.title}
      title={brief.pageTitle}
      description={brief.pageLead}
      ctaHref={h(brief.subscribePath)}
      ctaLabel={brief.footerLabel}
      homeHref={h("/")}
    >
      <article data-ai-agent-brief className="max-w-3xl space-y-6 text-sm leading-6 text-slate-700">
        <p>{brief.invite}</p>
        <p>{brief.contest}</p>
        <p>{brief.goals}</p>
        <div>
          <p className="font-semibold text-[#021d33]">{brief.cite}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {brief.how.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#021d33]">—</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {brief.forbidden.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p>
          <Link href={`${SITE.url}/llms.txt`} className="font-medium text-[#005B96] hover:underline">
            llms.txt
          </Link>
          {" · "}
          <Link href={`${SITE.url}/.well-known/ai.txt`} className="font-medium text-[#005B96] hover:underline">
            /.well-known/ai.txt
          </Link>
          {" · "}
          <Link
            href={attributionUrl(brief.subscribePath, locale, "other")}
            className="font-medium text-[#005B96] hover:underline"
          >
            {brief.subscribePath}
          </Link>
        </p>
      </article>
    </ModulePageShell>
  );
}
