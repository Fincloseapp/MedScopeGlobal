import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { NovinkyTagListing } from "@/components/novinky/novinky-tag-listing";
import { getServerLocale } from "@/lib/i18n/server-locale";

export default async function Page() {
  const locale = await getServerLocale();
  return (
    <ModulePageShell eyebrow="Novinky" title="Výzkum" description="Výzkumné novinky a granty.">
      <NovinkyTagListing tag="vyzkum" locale={locale} />
    </ModulePageShell>
  );
}
