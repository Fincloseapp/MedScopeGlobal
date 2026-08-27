import Image from "next/image";
import Link from "next/link";
import type { DisplayArticle } from "@/lib/queries/articles";
import { APP_PRODUCTS } from "@/lib/apps/catalog";
import {
  getPortalNewsNote,
  PORTAL_NEWS_TABS,
  getPortalPhilosophy,
} from "@/lib/v271/portal";
import { NEWS_DESKS, splitNewsDesks, type NewsDeskId } from "@/lib/v271/news-desks";
import { NewsArticleThumb, NewsDeskFallback, NewsHeadlineRow } from "@/components/articles/news-article-card";
import { PortalSearch } from "@/components/v271/portal-search";
import { WriterAgentsStrip } from "@/components/editorial/writer-agents-strip";
import { AppOpenLink } from "@/components/apps/app-origin-bar";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { VIP_PRICING } from "@/lib/ecosystem/monetization";
import { ArrowRight, Coins, Crown, Heart } from "lucide-react";

/** Marketing display names — OrdiZáznam is the Czech public alias for OrdiZapis */
const APP_MARKETING_NAME: Record<string, string> = {
  mediflow: "MediFlow",
  medipacient: "MeDipacient",
  ordizapis: "OrdiZáznam",
  mediprep: "MeDiprep",
};

const APP_PRICE_LINE: Record<string, string> = {
  mediflow: "Zdarma · VIP sync od 149 Kč/měsíc",
  medipacient: "Od 99 Kč/měsíc · tarif Veřejnost",
  ordizapis: "390 Kč/měsíc · 14 dní zdarma",
  mediprep: "Legacy · 149 Kč/měsíc Student LF",
};

function DeskColumn({
  desk,
  articles,
  featured,
}: {
  desk: NewsDeskId;
  articles: DisplayArticle[];
  featured?: boolean;
}) {
  const def = NEWS_DESKS.find((item) => item.id === desk)!;
  const lead = featured ? articles[0] : null;
  const rows = featured ? articles.slice(1, 4) : articles.slice(0, 4);
  const tipHref = lead
    ? `/article/${lead.slug}#article-tip-${lead.slug}`
    : "/articles";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005B96]">{def.label}</h3>
        <Link href={def.href} className="text-[11px] font-medium text-[#005B96] hover:underline">
          {def.more} →
        </Link>
      </div>
      {lead ? (
        <div className="mb-2">
          <Link href={`/article/${lead.slug}`} className="group block">
            <NewsArticleThumb article={lead} large sizes="(max-width: 768px) 100vw, 40vw" />
            <h4 className="mt-2 font-display text-base font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96]">
              {lead.title}
            </h4>
            {lead.excerpt ? (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{lead.excerpt}</p>
            ) : null}
          </Link>
          <p className="mt-2 text-[11px] text-slate-500">
            Líbí se vám text?{" "}
            <Link href={tipHref} className="font-semibold text-amber-800 underline-offset-2 hover:underline">
              Podpořit tringeltem
            </Link>
          </p>
        </div>
      ) : null}
      <div className="divide-y divide-slate-100 border-t border-slate-200">
        {rows.length > 0
          ? rows.map((article) => <NewsHeadlineRow key={article.id} article={article} />)
          : !lead
            ? <NewsDeskFallback desk={desk} />
            : null}
      </div>
    </div>
  );
}

function PortalNewsFeed({ articles }: { articles: DisplayArticle[] }) {
  const desks = splitNewsDesks(articles);

  return (
    <>
      <nav aria-label="Rubriky" className="mb-4 flex flex-wrap gap-x-4 gap-y-1 border-b border-slate-200 pb-3">
        {PORTAL_NEWS_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#005B96]"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-500">{getPortalNewsNote()}</p>
      <div className="grid gap-6 sm:grid-cols-2">
        <DeskColumn desk="novinky" articles={desks.novinky} featured />
        <DeskColumn desk="verejnost" articles={desks.verejnost} featured />
        <DeskColumn desk="dlouhovekost" articles={desks.dlouhovekost} featured />
        <DeskColumn desk="clanky" articles={desks.clanky} featured />
      </div>
    </>
  );
}

/** Full-bleed product phones — MediFlow / Ordi / MeDipacient (distinct assets) */
function HeroPhones() {
  return (
    <div className="portal-hero-phones relative mx-auto h-[min(58vh,420px)] w-full max-w-md lg:mx-0 lg:h-[min(72vh,520px)] lg:max-w-none">
      <div className="portal-phone portal-phone-a absolute left-[2%] top-[6%] w-[48%] overflow-hidden rounded-[1.75rem] shadow-[0_28px_70px_rgba(2,29,51,0.55)] ring-1 ring-white/15">
        <Image
          src={APP_MARKETING_IMAGE.mediflow}
          alt="MediFlow — wellness deník"
          width={480}
          height={720}
          className="h-auto w-full object-cover object-top"
          priority
          sizes="(max-width: 1024px) 40vw, 220px"
        />
      </div>
      <div className="portal-phone portal-phone-b absolute right-0 top-[14%] w-[54%] overflow-hidden rounded-[1.75rem] shadow-[0_32px_80px_rgba(2,29,51,0.6)] ring-1 ring-white/15">
        <Image
          src={APP_MARKETING_IMAGE.ordizapis}
          alt="OrdiZáznam — zápisy pro ordinaci"
          width={480}
          height={960}
          className="h-auto w-full object-cover"
          priority
          sizes="(max-width: 1024px) 45vw, 260px"
        />
      </div>
      <div className="portal-phone portal-phone-c absolute bottom-0 left-[18%] w-[44%] overflow-hidden rounded-[1.5rem] shadow-[0_22px_56px_rgba(2,29,51,0.5)] ring-1 ring-white/10">
        <Image
          src={APP_MARKETING_IMAGE.medipacient}
          alt="MeDipacient — lékařské zprávy"
          width={480}
          height={960}
          className="h-auto w-full object-cover object-top"
          sizes="(max-width: 1024px) 35vw, 200px"
        />
      </div>
    </div>
  );
}

function AppsShowcase() {
  const featured = APP_PRODUCTS.filter((a) => a.id !== "mediprep");
  const legacy = APP_PRODUCTS.find((a) => a.id === "mediprep");

  return (
    <div className="space-y-6">
      <ul className="grid gap-6 md:grid-cols-3">
        {featured.map((app, i) => {
          const name = APP_MARKETING_NAME[app.id] ?? app.shortName;
          return (
            <li key={app.id} className="portal-reveal" style={{ animationDelay: `${0.08 * (i + 1)}s` }}>
              <AppOpenLink
                href={app.appPath}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 transition hover:border-[#005B96]/35 hover:bg-white"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#e8f3fb] to-slate-100">
                  <Image
                    src={APP_MARKETING_IMAGE[app.id]}
                    alt={`${name} — ${app.tagline}`}
                    fill
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-semibold text-[#021d33]">{name}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{app.tagline}</p>
                  <p className="mt-2 text-xs font-medium text-[#005B96]">
                    {APP_PRICE_LINE[app.id] ?? app.priceNote}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#005B96]">
                    Otevřít
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </AppOpenLink>
            </li>
          );
        })}
      </ul>

      {legacy ? (
        <p className="text-center text-xs text-slate-500">
          {legacy.shortName} (příprava na LF) zůstává jako legacy aplikace —{" "}
          <AppOpenLink href={legacy.appPath} className="font-medium text-[#005B96] hover:underline">
            otevřít
          </AppOpenLink>
          .
        </p>
      ) : null}
    </div>
  );
}

/** Single clear VIP offer — price, what you get, one primary CTA */
function VipOfferSection() {
  const vip = VIP_PRICING.cs;

  return (
    <section
      aria-labelledby="portal-vip-heading"
      className="relative overflow-hidden bg-gradient-to-br from-[#1a1408] via-[#2a1f0a] to-[#021d33] text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(245,158,11,0.28), transparent 55%), radial-gradient(ellipse 40% 40% at 10% 80%, rgba(0,91,150,0.25), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">
            VIP Longevity · jasná nabídka
          </p>
          <h2 id="portal-vip-heading" className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            10 protokolů. Jeden plán. {vip.label}.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Spánek, metabolismus, pohyb a mentální wellness — evidence-based postupy bez zázračných slibů.
            MediFlow sync a PDF export v ceně. Odděleně od tarifů Student LF / OrdiZapis.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-white/80">
            <li>· 10 longevity protokolů (VIP knihovna)</li>
            <li>· Sync do MediFlow deníku</li>
            <li>· 14 dní zkušebně · zrušení kdykoli</li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/predplatne?trial=1&plan=vip"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-[#1a1408] transition hover:bg-amber-300"
            >
              Začít 14 dní zdarma
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/vip/protokoly"
              className="inline-flex items-center rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:border-white/50"
            >
              Prohlédnout protokoly
            </Link>
          </div>
        </div>
        <div className="relative mx-auto hidden w-full max-w-sm lg:block">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/15">
            <Image
              src={APP_MARKETING_IMAGE.mediflow}
              alt="MediFlow s VIP protokoly"
              fill
              className="object-cover object-top"
              sizes="320px"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
              <p className="font-display text-lg font-semibold">MediFlow + VIP</p>
              <p className="text-sm text-white/70">{vip.label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Compact monetization paths — tip / donate / VIP — not a card clutter grid */
function MonetizationSupportStrip() {
  return (
    <section aria-label="Podpora redakce" className="border-y border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">Podpora</p>
          <p className="mt-1 font-display text-lg font-semibold text-[#021d33]">
            Magazín zdarma. Redakci drží tipy a VIP.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/80 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
          >
            <Coins className="h-4 w-4" aria-hidden />
            Tringelt u článku
          </Link>
          <Link
            href="/article/optimalizace-spanku#article-tip-optimalizace-spanku"
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
          >
            <Heart className="h-4 w-4" aria-hidden />
            Dar redakci
          </Link>
          <Link
            href="/vip/protokoly"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#021d33] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005B96]"
          >
            <Crown className="h-4 w-4" aria-hidden />
            VIP · 149 Kč
          </Link>
        </div>
      </div>
    </section>
  );
}

function MagazineContributeBanner() {
  return (
    <div className="portal-reveal mt-6 flex flex-col gap-3 rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-[#e8f3fb] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm text-slate-700">
        <span className="font-semibold text-[#021d33]">Podpořte autonomní redakci</span>
        {" — "}
        tringelt od 2 Kč u článku, nebo VIP protokoly za 149 Kč/měsíc.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/articles"
          className="inline-flex rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
        >
          Číst a přispět
        </Link>
        <Link
          href="/vip/protokoly"
          className="inline-flex rounded-lg border border-[#021d33]/20 px-4 py-2 text-xs font-semibold text-[#021d33] hover:border-[#005B96]"
        >
          VIP nabídka
        </Link>
      </div>
    </div>
  );
}

export function PortalHome({
  articles,
  philosophy,
}: {
  articles: DisplayArticle[];
  philosophy: ReturnType<typeof getPortalPhilosophy>;
}) {
  const brand = philosophy.magazineName ?? "VitaScope";

  return (
    <div className="border-b border-slate-200">
      {/* 1 — Hero: VitaScope only (first viewport) */}
      <section
        aria-label={`${brand} úvod`}
        className="portal-hero relative isolate min-h-[100svh] overflow-hidden text-white"
      >
        <div className="portal-hero-atmosphere absolute inset-0" aria-hidden />
        <div className="portal-hero-pattern absolute inset-0 opacity-40" aria-hidden />

        <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:py-20">
          <div className="portal-hero-copy max-w-xl">
            <p className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {brand}
            </p>
            <h1 className="mt-5 font-display text-2xl font-semibold leading-snug text-white/95 sm:text-3xl lg:text-[2.15rem]">
              {philosophy.claim}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
              {philosophy.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#021d33] transition hover:bg-[#e8f3fb]"
              >
                Číst magazín
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/vip/protokoly"
                className="inline-flex items-center rounded-lg border border-white/35 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
              >
                VIP · 149 Kč/měsíc
              </Link>
            </div>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
              {philosophy.eyebrow}
            </p>
          </div>

          <div className="portal-hero-visual min-w-0">
            <HeroPhones />
          </div>
        </div>
      </section>

      {/* 2 — Magazine / news + tip CTAs */}
      <section aria-labelledby="portal-magazine-heading" className="bg-[#f3f7fb]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="portal-reveal max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">Magazín</p>
            <h2 id="portal-magazine-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33] sm:text-4xl">
              {brand} — zpravodajství
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Dlouhověkost, životní styl a evidence — srozumitelně, bez senzací.
            </p>
          </div>

          <div className="portal-reveal mt-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <PortalSearch />
          </div>

          <MagazineContributeBanner />

          <div className="portal-reveal mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-[#021d33]">Aktuální desk</h3>
              <Link href="/articles" className="text-sm font-semibold text-[#005B96] hover:underline">
                Všechny články →
              </Link>
            </div>
            <PortalNewsFeed articles={articles} />
          </div>

          <div className="mt-6">
            <WriterAgentsStrip />
          </div>
        </div>
      </section>

      {/* 3 — Apps with correct marketing images */}
      <section aria-labelledby="portal-apps-heading" className="bg-gradient-to-b from-white via-[#f7fafc] to-[#eef4f9]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="portal-reveal mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">Aplikace</p>
            <h2 id="portal-apps-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33] sm:text-4xl">
              MediFlow · MeDipacient · OrdiZáznam
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Každá aplikace má vlastní obrazovku a cenu — wellness deník, lékařské zprávy, zápisy pro ordinaci.
            </p>
          </div>
          <div className="mt-10">
            <AppsShowcase />
          </div>
        </div>
      </section>

      {/* 4 — Clear VIP subscription */}
      <VipOfferSection />

      {/* 5 — Monetization paths */}
      <MonetizationSupportStrip />

      {/* 6 — Closing CTA */}
      <section className="relative overflow-hidden bg-[#021d33] text-white">
        <div className="portal-cta-glow absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 sm:py-16">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Začněte s {brand}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base">
              Magazín zdarma. VIP longevity od 149 Kč/měsíc — 14 dní na vyzkoušení.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/articles"
              className="inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#021d33] hover:bg-[#e8f3fb]"
            >
              Číst články
            </Link>
            <Link
              href="/predplatne?trial=1&plan=vip"
              className="inline-flex rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:border-white/60"
            >
              VIP 14 dní zdarma
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
