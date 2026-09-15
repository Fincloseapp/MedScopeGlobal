import type { Metadata } from "next";
import Link from "next/link";
import { MarketplaceTutorialPlayer } from "@/components/marketplace/marketplace-tutorial-player";
import { MarketplaceIntakeForm } from "@/components/marketplace/marketplace-intake-form";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return await buildLocalizedPageMetadata({
    title: "Návod pro inzerenty tržiště",
    description: "Jak zveřejnit nabídku, vidět poptávky a objednat paušál na tržišti MedScopeGlobal.",
    path: "/exchange/navod",
    locale,
  });
}

const STEPS = [
  {
    title: "Vyberte stranu",
    body: "Jste výrobce nebo distributor? Zadejte nabídku. Jste nemocnice nebo laboratoř? Zadejte poptávku zdarma.",
  },
  {
    title: "Pošlete formulář nebo e-mail",
    body: "Stejný příjem: formulář na tržišti nebo inzerce@medscopeglobal.com. Automatická odpověď potvrdí, že zpráva dorazila.",
  },
  {
    title: "Nabídka je hned na desce",
    body: "Kupující ji vidí v sloupci Nabídky inzerentů. Kontakt z vaší strany zůstane skrytý, dokud není paušál aktivní.",
  },
  {
    title: "Poptávky vidíte bez čekání",
    body: "Sloupec Poptávky ukazuje, co instituce hledají. Celý e-mail poptávajícího dostanete po paušálu, podle SLA tarifu.",
  },
  {
    title: "Paušál spustí plnění",
    body: "Od 450 Kč / měsíc (roční 375 Kč / měs., 2 měsíce zdarma): profil /partneri, předání poptávek a plochy, které paušál zahrnuje. Jednorázové bannery v článcích jsou jiný produkt na /firmy — nepatří sem.",
  },
];

export default async function ExchangeGuidePage() {
  const locale = await getServerLocale();
  const exchangeHref = localizePublicHref("/exchange", locale);
  const pausalHref = localizePublicHref("/inzerce/pausal", locale);

  return (
    <div className="bg-[#f4f7fa]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">Tržiště · inzerenti</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">Jednoduchý návod</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Cíl: inzerent hned vidí, co tržiště přidává — viditelné nabídky, živé poptávky, e-mail i formulář, autonomní
          odpovědi. Lékařská zóna zůstává bez reklam.
        </p>
        <div className="mt-8">
          <MarketplaceTutorialPlayer />
        </div>
        <ol className="mt-10 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">Krok {index + 1}</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-[#021d33]">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={exchangeHref} className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white">
            Zpět na tržiště
          </Link>
          <Link href={pausalHref} className="rounded-full border border-[#005B96] px-5 py-2.5 text-sm font-semibold text-[#005B96]">
            Objednat paušál
          </Link>
        </div>
        <div className="mt-10">
          <MarketplaceIntakeForm />
        </div>
      </div>
    </div>
  );
}
