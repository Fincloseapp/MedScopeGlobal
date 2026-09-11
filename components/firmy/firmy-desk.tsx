import Image from "next/image";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V271B2BPricingTable } from "@/components/v271/b2b-pricing-table";
import { MARKETPLACE_VISUALS } from "@/lib/brand/marketing-visuals";
import { SITE } from "@/lib/config/site";
import { getB2bPublicCopy } from "@/lib/i18n/b2b-public-copy";
import { getFirmyDeskCopy, type FirmyRoomId } from "@/lib/i18n/firmy-desk-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { getServerLocale, getServerRegion } from "@/lib/i18n/server-locale";

export async function FirmyDesk({ slug }: { slug?: FirmyRoomId }) {
  const locale = await getServerLocale();
  const region = await getServerRegion();
  const publicCopy = getB2bPublicCopy(locale);
  const desk = getFirmyDeskCopy(locale);
  const room = slug ? desk.rooms[slug] : null;
  const formHref = localizePublicHref("/inzerce/formular", locale);
  const contactHref = localizePublicHref("/kontakt", locale);
  const banner = formatCzkListPrice(5000, locale, region);
  const article = formatCzkListPrice(15000, locale, region);
  const cosmetics = formatCzkListPrice(22000, locale, region);
  const cosmeticsHubHref = localizePublicHref("/verejnost/clanky?topic=kosmetika", locale);

  return (
    <ModulePageShell
      eyebrow={desk.eyebrow}
      title={room?.title ?? desk.title}
      description={room?.lead ?? desk.lead}
      ctaHref={slug === "reklama" ? localizePublicHref("/firmy/reklama/nova", locale) : formHref}
      ctaLabel={slug === "reklama" ? "Vložit reklamu" : publicCopy.contactSales}
      homeHref={localizePublicHref("/", locale)}
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={localizePublicHref("/", locale)} className="hover:text-foreground">
          {publicCopy.home}
        </Link>
        <span className="mx-2">/</span>
        <Link href={localizePublicHref("/firmy", locale)} className="hover:text-foreground">
          {desk.eyebrow}
        </Link>
        {room ? (
          <>
            <span className="mx-2">/</span>
            <span>{room.title}</span>
          </>
        ) : null}
      </nav>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { value: banner, label: publicCopy.bannerMonth, desc: publicCopy.bannerDesc },
          { value: article, label: publicCopy.sponsoredLabel, desc: publicCopy.sponsoredDesc },
          { value: cosmetics, label: desk.rooms.kosmetika.title, desc: desk.rooms.kosmetika.body },
          { value: publicCopy.replyValue, label: publicCopy.replyLabel, desc: publicCopy.replyDesc },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
            <p className="font-display text-2xl font-bold text-[#021d33]">{item.value}</p>
            <p className="mt-1 text-sm font-semibold text-[#005B96]">{item.label}</p>
            <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>

      {slug === "kosmetika" ? (
        <p className="mb-8 rounded-2xl border border-[#cfe1f3] bg-[#f7fbff] px-5 py-4 text-sm leading-6 text-slate-600">
          {desk.rooms.kosmetika.lead}{" "}
          <Link href={cosmeticsHubHref} className="font-semibold text-[#005B96] hover:underline">
            {desk.rooms.kosmetika.title} →
          </Link>
        </p>
      ) : null}

      <section
        data-studio="firmy-exchange-teaser"
        className="mb-8 overflow-hidden rounded-2xl border border-[#021d33] bg-[#021d33] text-white md:grid md:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)]"
      >
        <div className="relative min-h-[160px] bg-[#0b2a44]">
          <Image
            src={MARKETPLACE_VISUALS.workstation}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width:768px) 100vw, 288px"
          />
        </div>
        <div className="px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e8d5a3]">
            {desk.exchangeKicker}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold">{desk.exchangeTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{desk.exchangeLead}</p>
          <Link
            href={localizePublicHref("/exchange", locale)}
            className="mt-4 inline-flex rounded-full bg-[#c4a35a] px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-[#e8d5a3]"
          >
            {desk.exchangeCta}
          </Link>
        </div>
      </section>

      <V271B2BPricingTable compact locale={locale} />

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
          {desk.roomsKicker}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">{desk.roomsTitle}</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {(Object.values(desk.rooms) as (typeof desk.rooms)[keyof typeof desk.rooms][]).map((item) => (
            <li key={item.href}>
              <Link
                href={localizePublicHref(item.href, locale)}
                className="block h-full rounded-2xl border border-[#cfe1f3] bg-white px-5 py-5 transition hover:border-[#005B96]/40 hover:shadow-sm"
              >
                <span className="font-display text-lg font-semibold text-[#021d33]">{item.title}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{item.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        {publicCopy.questions}{" "}
        <Link href={contactHref} className="text-[#005B96] underline">
          {publicCopy.contact}
        </Link>{" "}
        <a href={`mailto:${SITE.supportEmail}`} className="text-[#005B96] underline">
          {SITE.supportEmail}
        </a>
      </p>
    </ModulePageShell>
  );
}
