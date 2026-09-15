import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PausalOrderForm } from "@/components/sales/pausal-order-form";
import {
  formatSalesPrice,
  SALES_PACKAGES,
  salesFromPriceLabel,
  salesYearlyCzk,
  salesYearlyEffectiveMonthCzk,
} from "@/lib/sales/packages";
import { salesPayInstructions } from "@/lib/sales/pay";
import { aresSubjectUrl, getLegalEntity, publicBrandSignature, publicOperatorCaption } from "@/lib/config/legal-entity";
import { SITE } from "@/lib/config/site";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { convertCzkToCharge } from "@/lib/i18n/payment-currency";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const from = salesFromPriceLabel(locale);
  return {
    title: locale === "cs" ? "Měsíční paušál inzerce na tržišti" : "Marketplace retainer — MedScopeGlobal",
    description:
      locale === "cs"
        ? `Plaťte paušál ${from} / měsíc. Roční předplatné má 2 měsíce zdarma. Tržiště zpracuje inzerci, fakturu a poptávky. Karta Stripe nebo převod.`
        : `Start retainer ${from} / month. Annual billing includes two months free. Card or bank transfer.`,
  };
}

export default async function InzercePausalPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
}) {
  const locale = await getServerLocale();
  const pay = salesPayInstructions();
  const entity = getLegalEntity();
  const query = await searchParams;
  const paid = query.paid === "1";
  const cancelled = query.cancelled === "1";
  const ui = getMarketplaceUiCopy(locale);
  const origin = SITE.url.replace(/\/$/, "");
  const currency = convertCzkToCharge(450, locale).currency.toUpperCase();
  const offers = SALES_PACKAGES.map((pkg) => ({
    "@type": "Offer",
    name: pkg.name,
    price: convertCzkToCharge(pkg.priceCzkMonth, locale).major,
    priceCurrency: currency,
    availability: "https://schema.org/InStock",
    url: `${origin}${localizePublicHref("/inzerce/pausal", locale)}`,
  }));
  const startYearEffective = formatSalesPrice(
    salesYearlyEffectiveMonthCzk(SALES_PACKAGES[0]!.priceCzkMonth),
    locale
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "MedScopeGlobal marketplace retainer",
            description:
              locale === "cs"
                ? `Plaťte paušál ${salesFromPriceLabel(locale)} / měsíc.`
                : `Start retainer ${salesFromPriceLabel(locale)} / month.`,
            brand: { "@type": "Brand", name: "MedScopeGlobal" },
            offers,
          }),
        }}
      />
    <ModulePageShell
      eyebrow="MedScopeGlobal · marketplace"
      title={
        locale === "cs"
          ? "Plaťte paušál. Inzerce se zpracuje v tržišti."
          : "Pay the retainer. Advertising is fulfilled on the marketplace."
      }
      description={
        locale === "cs"
          ? `${salesFromPriceLabel(locale)} měsíčně, nebo ${startYearEffective} / měs. při roční platbě (2 měsíce zdarma). Nejde o jednorázový banner v článku — ten zůstává na /firmy. Neplátce DPH.`
          : `${salesFromPriceLabel(locale)} / month, or ${startYearEffective} / month billed yearly (two months free). Article banners are a different product.`
      }
      ctaHref="#objednat"
      ctaLabel={locale === "cs" ? "K objednávce a platbě" : "Order and pay"}
    >
      {paid ? (
        <p className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {locale === "cs"
            ? "Platba kartou proběhla. Potvrzení jde na e-mail. Aktivace ploch doběhne autonomně, jakmile je databáze a webhook v pořádku — jinak obchodní oddělení naváže tentýž den."
            : "Card payment received. Confirmation is on its way by email."}
        </p>
      ) : null}
      {cancelled ? (
        <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {locale === "cs"
            ? `Platba kartou byla zrušená. Objednávku můžete odeslat znovu, nebo napište na ${pay.inbox}.`
            : `Card payment was cancelled. You can retry, or write to ${pay.inbox}.`}
        </p>
      ) : null}

      <div className="mb-8 rounded-2xl border border-[#021d33] bg-[#021d33] px-5 py-4 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e8d5a3]">
          MedScopeGlobal · {entity.domain}
        </p>
        <p className="mt-1 font-display text-lg font-semibold">{pay.sellerName}</p>
        <p className="mt-1 text-sm text-white/80">
          {publicOperatorCaption(locale, entity)}
          {pay.sellerIco ? (
            <>
              {" "}
              · IČO {pay.sellerIco} ·{" "}
              <a className="underline decoration-white/40" href={aresSubjectUrl(pay.sellerIco)} target="_blank" rel="noreferrer">
                ARES
              </a>
            </>
          ) : null}{" "}
          · {locale === "cs" ? "neplátce DPH" : "not VAT-registered in Czechia"}
        </p>
        <p className="mt-2 text-sm text-white/75">
          {pay.stripeReady
            ? locale === "cs"
              ? "Dnes: karta Stripe (měsíčně nebo ročně, 2 měsíce zdarma)."
              : "Today: Stripe card (monthly or yearly, two months free)."
            : locale === "cs"
              ? "Karta Stripe se dopisuje."
              : "Card checkout is being connected."}{" "}
          {pay.iban ? `IBAN ${pay.iban}.` : ""} {pay.inbox}
          {pay.supportPhone ? ` · ${pay.supportPhone}` : ""}.
        </p>
      </div>

      <p className="mb-6 text-sm text-slate-600">{ui.pausalBanner}</p>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SALES_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-2xl border p-5 ${pkg.highlighted ? "border-[#005B96] bg-[#f3f9ff]" : "border-[#cfe1f3] bg-white"}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">{pkg.name}</p>
            <p className="mt-2 font-display text-3xl font-bold text-[#021d33]">{formatSalesPrice(pkg.priceCzkMonth, locale)}</p>
            <p className="text-xs text-slate-500">{locale === "cs" ? "měsíčně · neplátce DPH" : "per month · no Czech VAT"}</p>
            <p className="mt-1 text-sm font-semibold text-[#005B96]">
              {locale === "cs" ? "Ročně" : "Yearly"} {formatSalesPrice(salesYearlyEffectiveMonthCzk(pkg.priceCzkMonth), locale)} / {locale === "cs" ? "měs." : "mo"} · {formatSalesPrice(salesYearlyCzk(pkg.priceCzkMonth), locale)} / {locale === "cs" ? "rok" : "year"}
            </p>
            <p className="text-[11px] text-slate-500">
              {locale === "cs" ? "2 měsíce zdarma při roční platbě" : "Two months free on annual billing"}
            </p>
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
        {ui.orderPausal}
      </h2>
      <PausalOrderForm defaultPackage="start" pay={pay} locale={locale} />
      <p className="mt-6 text-sm text-slate-600">
        {ui.magazineOther}{" "}
        <Link href={localizePublicHref("/inzerce/formular", locale)} className="text-[#005B96] underline">
          /inzerce/formular
        </Link>
        .{" "}
        <Link href={localizePublicHref("/exchange", locale)} className="text-[#005B96] underline">
          /exchange
        </Link>
        .
      </p>
      <p className="mt-4 text-xs text-slate-500">{publicBrandSignature(locale)}</p>
    </ModulePageShell>
    </>
  );
}
