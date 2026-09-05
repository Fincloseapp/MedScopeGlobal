import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ProMeFeed } from "@/components/v6/pro-me-feed";
import { getProMeCopy, type ProMeAudience } from "@/lib/i18n/pro-me-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getPersonalizedFeed } from "@/lib/queries/v6/personalization";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function proMeAudienceMetadata(audience: ProMeAudience): Promise<Metadata> {
  const locale = await getServerLocale();
  const item = getProMeCopy(locale).audiences[audience];
  return await buildLocalizedV20PageMetadata({
    title: item.metaTitle,
    description: item.description,
    path: item.href,
    locale,
  });
}

export async function ProMeAudiencePage({ audience }: { audience: ProMeAudience }) {
  const locale = await getServerLocale();
  const copy = getProMeCopy(locale);
  const item = copy.audiences[audience];
  const items = await getPersonalizedFeed(audience);

  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={item.title}
      description={item.description}
      homeHref={localizePublicHref("/", locale)}
    >
      <ProMeFeed items={items} audience={audience} />
    </ModulePageShell>
  );
}
