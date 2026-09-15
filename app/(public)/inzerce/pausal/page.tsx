import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PausalOrderForm } from "@/components/sales/pausal-order-form";
import { formatSalesCzk, SALES_PACKAGES, salesFromPriceLabel, salesYearlyCzk, salesYearlyEffectiveMonthCzk } from "@/lib/sales/packages";
import { salesPayInstructions } from "@/lib/sales/pay";
import { aresSubjectUrl } from "@/lib/config/legal-entity";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Měsíční paušál inzerce na tržišti",
  description:
    `Plaťte paušál ${salesFromPriceLabel()} / měsíc. Roční předplatné má 2 měsíce zdarma. Tržiště zpracuje inzerci, fakturu a poptávky. Karta Stripe nebo převod.`,
};

export default async function InzercePausalPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
}) {
  const pay = salesPayInstructions();
  const query = await searchParams;
  const paid = query.paid === "1";
  const cancelled = query.cancelled === "1";

  const origin = SITE.url.replace(/\/$/, "");
  const offers = SALES_PACKAGES.map((pkg) => ({
    "@type": "Offer",
    name: pkg.name,
    price: pkg.priceCzkMonth,
    priceCurrency: "CZK",
    availability: "https://schema.org/InStock",
    url: `${origin}/inzerce/pausal`,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Měsíční paušál inzerce na tržišti MedScopeGlobal",
            description: metadata.description,
            brand: { "@type": "Brand", name: "MedScopeGlobal" },
            offers,
          }),
        }}
      />
    <ModulePageShell
      eyebrow="Tržiště · paušál"
      title="Plaťte paušál. Inzerce se zpracuje v tržišti."
      description={`${salesFromPriceLabel()} měsíčně, nebo ${formatSalesCzk(salesYearlyEffectiveMonthCzk(SALES_PACKAGES[0]!.priceCzkMonth))} / měs. při roční platbě (2 měsíce zdarma). Nejde o jednorázový banner v článku — ten zůstává na /firmy. Neplátce DPH.`}
      ctaHref="#objednat"
      ctaLabel="K objednávce a platbě"
    >
      {paid ? (
        <p className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Platba kartou proběhla. Potvrzení jde na e-mail. Aktivace ploch doběhne autonomně, jakmile je databáze a webhook
          v pořádku — jinak obchodní oddělení naváže tentýž den.
        </p>
      ) : null}
      {cancelled ? (
        <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Platba kartou byla zrušená. Objednávku můžete odeslat znovu, nebo napište na {pay.inbox}.
        </p>
      ) : null}

      <div className="mb-8 rounded-2xl border border-[#021d33] bg-[#021d33] px-5 py-4 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e8d5a3]">Provozovatel · ARES</p>
        <p className="mt-1 font-display text-lg font-semibold">{pay.sellerName}</p>
        <p className="mt-1 text-sm text-white/80">
          IČO {pay.sellerIco}
          {pay.sellerIco ? (
            <>
              {" "}
              ·{" "}
              <a className="underline decoration-white/40" href={aresSubjectUrl(pay.sellerIco)} target="_blank" rel="noreferrer">
                ověřit v ARES
              </a>
            </>
          ) : null}{" "}
          · neplátce DPH
        </p>
        <p className="mt-2 text-sm text-white/75">
          {pay.stripeReady ? "Dnes: karta Stripe (měsíčně nebo ročně, 2 měsíce zdarma)." : "Karta Stripe se dopisuje."}{" "}
          {pay.iban ? `Převod IBAN ${pay.iban}.` : "Převod po doplnění IBAN v prostředí, nebo e-mailem na schránku tržiště."}{" "}
          Schránka {pay.inbox}
          {pay.supportPhone ? ` · ${pay.supportPhone}` : ""}.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SALES_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-2xl border p-5 ${pkg.highlighted ? "border-[#005B96] bg-[#f3f9ff]" : "border-[#cfe1f3] bg-white"}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">{pkg.name}</p>
            <p className="mt-2 font-display text-3xl font-bold text-[#021d33]">{formatSalesCzk(pkg.priceCzkMonth)}</p>
            <p className="text-xs text-slate-500">měsíčně · neplátce DPH</p>
            <p className="mt-1 text-sm font-semibold text-[#005B96]">
              Ročně {formatSalesCzk(salesYearlyEffectiveMonthCzk(pkg.priceCzkMonth))} / měs. · {formatSalesCzk(salesYearlyCzk(pkg.priceCzkMonth))} / rok
            </p>
            <p className="text-[11px] text-slate-500">2 měsíce zdarma při roční platbě</p>
            <p className="mt-2 text-sm text-slate-600">{pkg.tagline}</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {pkg.features.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <h2 id="objednat" className="mb-4 scroll-mt-24 font-display text-2xl font-semibold text-[#021d33]">
        Objednat paušál
      </h2>
      <PausalOrderForm defaultPackage="start" pay={pay} />
      <p className="mt-6 text-sm text-slate-600">
        Jednorázový banner v magazínu je jiný produkt:{" "}
        <Link href="/inzerce/formular" className="text-[#005B96] underline">
          /inzerce/formular
        </Link>
        . Živé poptávky:{" "}
        <Link href="/exchange" className="text-[#005B96] underline">
          /exchange
        </Link>
        .
      </p>
    </ModulePageShell>
    </>
  );
}
