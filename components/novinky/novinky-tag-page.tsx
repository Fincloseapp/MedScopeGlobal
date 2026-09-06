import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { NovinkyTagListing } from "@/components/novinky/novinky-tag-listing";
import { getNovinkyCopy, type NovinkyTagId } from "@/lib/i18n/novinky-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";

export async function NovinkyTagPage({
  tag,
  hrefForItem,
}: {
  tag: NovinkyTagId;
  hrefForItem?: (slug: string) => string;
}) {
  const locale = await getServerLocale();
  const item = getNovinkyCopy(locale).tags[tag];

  return (
    <ModulePageShell
      eyebrow={item.label}
      title={item.title}
      description={item.description}
      homeHref={localizePublicHref("/", locale)}
    >
      <NovinkyTagListing tag={tag} locale={locale} hrefForItem={hrefForItem} />
    </ModulePageShell>
  );
}
