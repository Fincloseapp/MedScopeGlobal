import { AdPortalForm } from "@/components/firmy/ad-portal-form";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return await buildLocalizedV20PageMetadata({
    title: "Vložit reklamu — B2B portál",
    description:
      "Firma vloží vizuál a text. Tři autonomní editoři MedScopeGlobal zkontrolují zákonnost, neškodnost a diplomatický tón. Po povolení platba a faktura.",
    path: "/firmy/reklama/nova",
    locale,
  });
}

export default async function NewAdPortalPage() {
  const locale = await getServerLocale();
  return (
    <ModulePageShell
      eyebrow="B2B portál"
      title="Vložit reklamní vizuál a text"
      description="Podle návodu. Lékařská a studentská zóna zůstává bez reklamy."
      ctaHref={localizePublicHref("/firmy/cenik", locale)}
      ctaLabel="Ceník"
      homeHref={localizePublicHref("/firmy", locale)}
    >
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
        <li>Vizuál: vlastní banner 1200×400 nebo 300×250, HTTPS URL, bez klamavé úpravy.</li>
        <li>Text: pravdivý, bez zázračných zdravotních slibů, bez nenávisti a politické kampaně.</li>
        <li>Tři autonomní editoři (právní, bezpečnost, diplomatický tón) běží hned. Admin potvrdí povoleno / nepovoleno.</li>
        <li>Po povolení zaplatíte kartou (Stripe) nebo QR převodem s variabilním symbolem. Na obrazovce je náhled faktury; po platbě faktura odejde na e-mail firmy.</li>
      </ol>
      <AdPortalForm locale={locale} />
    </ModulePageShell>
  );
}
