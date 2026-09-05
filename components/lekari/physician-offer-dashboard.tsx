import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { getPhysicianHubDashboardCopy } from "@/lib/i18n/physician-hub-dashboard-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { isCzechSurface } from "@/lib/i18n/surface-copy";
import { ORDIZAPIS } from "@/lib/lekari/dokumentace/branding";

const PHOTO = {
  cover: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1800&h=1200&fit=crop&q=80&auto=format",
  notes: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&h=900&fit=crop&q=80&auto=format",
  evidence: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=900&fit=crop&q=80&auto=format",
  decide: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=900&fit=crop&q=80&auto=format",
} as const;

type Room = {
  href: string;
  image: string;
  featured?: boolean;
  czechOnly?: boolean;
  title: { cs: string; en: string };
  body: { cs: string; en: string };
};

const ROOMS: Room[] = [
  {
    href: "/lekari/dokumentace",
    image: APP_MARKETING_IMAGE.ordizapis,
    featured: true,
    title: { cs: "OrdiZapis", en: "OrdiZapis" },
    body: {
      cs: "Nahrávka → strukturovaný zápis. 14 dní zdarma.",
      en: "Record → structured note. 14 days free.",
    },
  },
  {
    href: "/lekari/guidelines",
    image: PHOTO.evidence,
    featured: true,
    title: { cs: "Guidelines", en: "Guidelines" },
    body: {
      cs: "Klinická doporučení s odkazem na primární zdroj.",
      en: "Practice pathways with a primary-source link.",
    },
  },
  {
    href: "/lekari/studie",
    image: PHOTO.notes,
    title: { cs: "Studie", en: "Studies" },
    body: {
      cs: "RCT a meta-analýzy s DOI nebo PMID.",
      en: "RCTs and meta-analyses with a DOI or PMID.",
    },
  },
  {
    href: "/lekari/research-hub",
    image: PHOTO.decide,
    title: { cs: "Research Hub", en: "Research Hub" },
    body: {
      cs: "PubMed a AI analýza — ověřitelný identifikátor.",
      en: "PubMed and AI analysis — a verifiable identifier.",
    },
  },
  {
    href: "/lekari/ai-asistent",
    image: PHOTO.cover,
    title: { cs: "AI asistent", en: "AI assistant" },
    body: {
      cs: "Klinický kontext. Nediagnostikuje a neslibuje výsledek.",
      en: "Clinical context. It does not diagnose or promise an outcome.",
    },
  },
  {
    href: "/odborna",
    image: PHOTO.evidence,
    title: { cs: "Odborná sekce", en: "Professional desk" },
    body: {
      cs: "Vstup po ověření evidenčního čísla ČLK.",
      en: "Licensed-clinician access. It does not replace a medical board.",
    },
  },
  {
    href: "/leky",
    image: PHOTO.notes,
    title: { cs: "Léky", en: "Medicines" },
    body: {
      cs: "Regulační novinky z oficiálních zdrojů.",
      en: "Regulatory updates from official sources.",
    },
  },
  {
    href: "/academy/lekari",
    image: PHOTO.cover,
    czechOnly: true,
    title: { cs: "CME revmatologie", en: "Rheumatology CME" },
    body: {
      cs: "Akreditované testy jen pro revmatology. Jiné obory nepřidáváme.",
      en: "Accredited tests for rheumatologists only.",
    },
  },
];

function roomText(room: Room, czech: boolean, field: "title" | "body") {
  return czech ? room[field].cs : room[field].en;
}

export function PhysicianOfferDashboard({
  locale,
  children,
}: {
  locale: string;
  children?: ReactNode;
}) {
  const copy = getPhysicianHubDashboardCopy(locale);
  const czech = isCzechSurface(locale);
  const href = (path: string) => localizePublicHref(path, locale);
  const rooms = ROOMS.filter((room) => !room.czechOnly || czech);
  const featured = rooms.filter((room) => room.featured);
  const rest = rooms.filter((room) => !room.featured);

  return (
    <div className="overflow-hidden bg-[#f4f8fc] text-[#021d33]" data-studio="physician-desk">
      <section className="relative isolate overflow-hidden bg-[#021d33] text-white">
        <Image
          src={PHOTO.cover}
          alt=""
          fill
          priority
          className="object-cover opacity-[0.22]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#021d33] via-[#021d33]/92 to-[#005B96]/40" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">
              {copy.kicker}
            </p>
            <h1 className="mt-5 max-w-xl font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {copy.title[0]}
              <span className="mt-2 block font-normal text-sky-100">{copy.title[1]}</span>
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-7 text-sky-100/90">{copy.lead}</p>
            <p className="mt-4 font-mono text-[12px] tracking-wide text-sky-200">{copy.trial}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <V27CheckoutButton
                kind="subscription"
                productId="dokumentace-month"
                locale={locale}
                label={copy.openOrdi}
                className="rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50"
              />
              <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/10 hover:text-white">
                <Link href={href("/predplatne?trial=1")}>
                  {copy.physicianPlan}
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="rounded-full border border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={href("/odborna")}>{copy.desk}</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-[28px] border border-white/15 bg-[#03263f] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
              <Image
                src={APP_MARKETING_IMAGE.ordizapis}
                alt={ORDIZAPIS.shortName}
                width={720}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
              <div className="border-t border-white/10 px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200">
                  {ORDIZAPIS.shortName}
                </p>
                <p className="mt-1 text-sm text-sky-50">{copy.openOrdi}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
          {copy.methodKicker}
        </p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight">
          {copy.methodTitle}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {copy.method.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
          {copy.roomsKicker}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">{copy.roomsTitle}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{copy.roomsLead}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {featured.map((room) => (
            <Link
              key={room.href}
              href={href(room.href)}
              className="group relative min-h-[240px] overflow-hidden rounded-[28px] bg-[#021d33] text-white"
            >
              <Image
                src={room.image}
                alt=""
                fill
                className="object-cover opacity-40 transition duration-300 group-hover:scale-105 group-hover:opacity-50"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="relative flex h-full flex-col justify-end p-6">
                <p className="font-display text-2xl font-semibold">{roomText(room, czech, "title")}</p>
                <p className="mt-2 max-w-sm text-sm text-sky-100">{roomText(room, czech, "body")}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((room) => (
            <Link
              key={room.href}
              href={href(room.href)}
              className="rounded-2xl border border-[#cfe1f3] bg-white p-5 transition hover:border-[#005B96]/40 hover:shadow-sm"
            >
              <p className="font-display text-lg font-semibold">{roomText(room, czech, "title")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{roomText(room, czech, "body")}</p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">{copy.adsNote}</p>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-5 pb-16 sm:px-8">{children}</div>
      <p className="border-t border-[#cfe1f3] bg-white px-5 py-4 text-center text-xs text-slate-500">
        {copy.footnote}
      </p>
    </div>
  );
}
