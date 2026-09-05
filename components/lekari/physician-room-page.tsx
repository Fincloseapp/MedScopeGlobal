import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { PhysicianSectionNav } from "@/components/lekari/physician-section-nav";
import { getPhysicianHubDashboardCopy } from "@/lib/i18n/physician-hub-dashboard-copy";
import {
  getPhysicianRoomCopy,
  getPhysicianRoomDestinations,
  type PhysicianRoomId,
} from "@/lib/i18n/physician-room-copy";
import { localizeV271Page } from "@/lib/i18n/hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import type { V271HubPage } from "@/lib/v271/routes";

const ROOM_IMAGE: Record<PhysicianRoomId, string> = {
  guidelines: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1800&h=1200&fit=crop&q=80&auto=format",
  prehledy: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1800&h=1200&fit=crop&q=80&auto=format",
  studie: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1800&h=1200&fit=crop&q=80&auto=format",
  "research-hub": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1800&h=1200&fit=crop&q=80&auto=format",
  "ai-asistent": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1800&h=1200&fit=crop&q=80&auto=format",
};

export async function PhysicianRoomPage({
  page,
  slug,
}: {
  page: V271HubPage;
  slug: PhysicianRoomId;
}) {
  const locale = await getServerLocale();
  const localized = localizeV271Page(page, "lekari", locale);
  const copy = getPhysicianRoomCopy(locale);
  const hub = getPhysicianHubDashboardCopy(locale);
  const room = copy.rooms[slug];
  const destinations = getPhysicianRoomDestinations(locale, slug);

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-[#021d33]" data-studio="physician-room">
      <header className="relative isolate overflow-hidden bg-[#021d33] text-white">
        <Image
          src={ROOM_IMAGE[slug]}
          alt=""
          fill
          priority
          className="object-cover opacity-[0.22]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#021d33] via-[#021d33]/92 to-[#005B96]/40" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
            {copy.kicker}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            {localized.page.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-7 text-sky-100/90">{room.lead}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={localizePublicHref("/lekari", locale)}
              className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {copy.back}
            </Link>
            <V27CheckoutButton
              kind="subscription"
              productId="dokumentace-month"
              locale={locale}
              label={hub.openOrdi}
              className="rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50"
            />
            <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/10 hover:text-white">
              <Link href={localizePublicHref("/predplatne?trial=1", locale)}>
                {hub.physicianPlan}
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-5 py-10 sm:px-8">
        <PhysicianSectionNav current={`/lekari/${slug}`} />

        <section>
          <div className="grid gap-4 md:grid-cols-3">
            {room.method.map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
                <h2 className="font-display text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{room.source}</p>
        </section>

        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            {copy.destKicker}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">{copy.destTitle}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {destinations.map((link) => (
              <li key={link.href}>
                <Link
                  href={localizePublicHref(link.href, locale)}
                  className="flex h-full items-start justify-between gap-4 rounded-2xl border border-[#cfe1f3] bg-white px-5 py-5 transition hover:border-[#005B96]/40 hover:shadow-sm"
                >
                  <span>
                    <span className="block font-display text-lg font-semibold">{link.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">{link.body}</span>
                  </span>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {localized.page.ctaHref && localized.page.ctaLabel ? (
          <Link
            href={localized.page.ctaHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#005B96] hover:underline"
          >
            {localized.page.ctaLabel}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}

        <p className="text-xs text-slate-500">{copy.adsNote}</p>
      </div>
    </div>
  );
}
