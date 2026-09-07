import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { AdOrderClient } from "@/components/firmy/ad-order-client";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";

export const dynamic = "force-dynamic";

export default async function AdOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const locale = await getServerLocale();
  const { id } = await params;
  const { token } = await searchParams;
  return (
    <ModulePageShell
      eyebrow="B2B objednávka"
      title="Stav inzerce a faktura"
      description="Po povolení editorů zaplatíte kartou nebo QR. Náhled faktury je dole."
      ctaHref={localizePublicHref("/firmy/reklama/nova", locale)}
      ctaLabel="Nová žádost"
      homeHref={localizePublicHref("/firmy", locale)}
    >
      <AdOrderClient id={id} token={token ?? ""} />
    </ModulePageShell>
  );
}
