import Image from "next/image";
import Link from "next/link";
import { MarketplaceIntakeForm } from "@/components/marketplace/marketplace-intake-form";
import { MarketplaceTutorialPlayer } from "@/components/marketplace/marketplace-tutorial-player";
import { ChooseOfferForm } from "@/components/marketplace/choose-offer-form";
import type { MarketplaceBoard, MarketplacePublicCard } from "@/lib/marketplace/types";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";

function Card({
  item,
  locale,
  copy,
}: {
  item: MarketplacePublicCard;
  locale: string;
  copy: ReturnType<typeof getMarketplaceUiCopy>;
}) {
  return (
    <article
      id={item.id}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {item.image ? (
        <div className="relative h-36 bg-[#e8eef3]">
          <Image src={item.image} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 420px" />
        </div>
      ) : null}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#e8f3fb] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#005B96]">
            {item.badge}
          </span>
          <span className="text-xs text-slate-500">
            {item.region} · {item.category}
          </span>
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold text-[#021d33]">{item.title}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {item.companyLabel} · {item.cert}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-700">{item.summary}</p>
        {item.sample ? (
          <p className="mt-3 text-xs text-slate-500">{copy.sampleNote}</p>
        ) : item.contactHidden ? (
          <p className="mt-3 text-xs text-slate-500">{copy.contactHiddenNote}</p>
        ) : null}
        {item.href && item.sample ? (
          <Link href={item.href} className="mt-3 inline-flex text-sm font-semibold text-[#005B96] hover:underline">
            {item.kind === "offer" ? copy.openOffer : copy.showDemand} →
          </Link>
        ) : null}
        {item.kind === "offer" && !item.sample ? (
          <ChooseOfferForm offerId={item.id} offerTitle={item.title} locale={locale} />
        ) : null}
      </div>
    </article>
  );
}

export function MarketplaceDesk({
  board,
  locale,
  title,
  lead,
  kicker,
  firmyHref,
  firmyLinkLabel,
}: {
  board: MarketplaceBoard;
  locale: string;
  title: string;
  lead: string;
  kicker: string;
  firmyHref: string;
  firmyLinkLabel: string;
}) {
  const copy = getMarketplaceUiCopy(locale);
  const pausalHref = localizePublicHref("/inzerce/pausal", locale);
  const formHref = localizePublicHref("/inzerce/formular", locale);
  const navodHref = localizePublicHref("/exchange/navod", locale);
  const partneriHref = localizePublicHref("/partneri", locale);

  return (
    <div className="bg-[#f4f7fa]">
      <header className="border-b border-slate-200 bg-[#021d33] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e8d5a3]">
            {kicker}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
            {lead}{" "}
            <Link href={firmyHref} className="font-semibold text-[#e8d5a3] hover:underline">
              {firmyLinkLabel}
            </Link>
            .
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={pausalHref}
              className="rounded-full bg-[#c4a35a] px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-[#e8d5a3]"
            >
              {copy.orderPausalFrom}
            </Link>
            <Link
              href="#nabidky"
              className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {copy.offersNav}
            </Link>
            <Link
              href="#poptavky"
              className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {copy.demandsNav}
            </Link>
            <Link
              href="#formular"
              className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {copy.inquireNav}
            </Link>
            <Link href={navodHref} className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#e8d5a3] hover:underline">
              {copy.guideNav}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3">
        {copy.pillars.map((item) => (
          <div key={item.title} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-[#021d33]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#021d33] bg-white px-5 py-4">
          <p className="text-sm text-slate-700">{copy.pausalBanner}</p>
          <Link
            href={pausalHref}
            className="rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            {copy.orderPausal}
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-2">
        <section id="nabidky">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">{copy.forBuyers}</p>
              <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.offersHeading}</h2>
            </div>
            <Link href={partneriHref} className="text-sm font-semibold text-[#005B96] hover:underline">
              {copy.directory}
            </Link>
          </div>
          <div className="space-y-4">
            {board.offers.map((item) => (
              <Card key={item.id} item={item} locale={locale} copy={copy} />
            ))}
          </div>
        </section>
        <section id="poptavky">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">{copy.forAdvertisers}</p>
            <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.demandsHeading}</h2>
          </div>
          <div className="space-y-4">
            {board.demands.map((item) => (
              <Card key={item.id} item={item} locale={locale} copy={copy} />
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {copy.wantContacts}{" "}
            <Link href={pausalHref} className="font-semibold text-[#005B96] underline">
              {copy.orderPausal}
            </Link>
            . {copy.magazineOther}{" "}
            <Link href={formHref} className="font-semibold text-[#005B96] underline">
              /firmy
            </Link>
            .
          </p>
        </section>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-16 sm:px-6">
        <MarketplaceTutorialPlayer locale={locale} />
        <MarketplaceIntakeForm locale={locale} />
      </div>
    </div>
  );
}
