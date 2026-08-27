import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { LONGEVITY_PROTOCOLS, localizedText } from "@/lib/ecosystem/longevity-protocols";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { MEDICAL_DISCLAIMER } from "@/lib/ecosystem/locales";
import { VIP_PRICING } from "@/lib/ecosystem/monetization";

export const metadata: Metadata = buildPageMetadata({
  title: "VIP Longevity Protokoly | MedScopeGlobal",
  description:
    "10 vědecky podložených protokolů pro dlouhověkost: spánek, metabolismus, suplementy, biohacking a více. VIP předplatné.",
  path: "/vip/protokoly",
});

export default function VipProtocolsPage() {
  const pricing = VIP_PRICING.cs;
  return (
    <div className="bg-[#0c0a08] text-white">
      {/* Full-bleed VIP hero — brand first, no badge clutter */}
      <section className="relative isolate min-h-[min(88vh,820px)] overflow-hidden">
        <div
          className="mkt-drift absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(245,158,11,0.28),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(120,53,15,0.35),transparent_40%),linear-gradient(160deg,#0c0a08_0%,#1a140c_50%,#0f1a22_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(88vh,820px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:justify-center">
          <div className="max-w-2xl">
            <p className="mkt-rise text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300/90">
              MedScopeGlobal VIP
            </p>
            <h1 className="mkt-rise-delay-1 mt-3 font-display text-[clamp(2.75rem,8vw,5.25rem)] font-bold leading-[0.95] tracking-tight">
              Longevity
              <br />
              protokoly
            </h1>
            <p className="mkt-rise-delay-2 mt-5 max-w-lg text-lg leading-relaxed text-amber-50/80 sm:text-xl">
              Deset vědecky podložených plánů — spánek, metabolismus, imunita. Denní rytmus, suplementy
              a lab testy, napojené na MediFlow.
            </p>
            <div className="mkt-rise-delay-2 mt-9 flex flex-wrap items-center gap-5">
              <Link
                href="/predplatne"
                className="inline-flex items-center gap-2 bg-[#f5c84b] px-7 py-3.5 text-sm font-semibold text-[#1a1005] shadow-[0_0_40px_rgba(245,200,75,0.35)] transition hover:bg-[#ffd666]"
              >
                Aktivovat VIP · {pricing.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#protokoly"
                className="text-sm font-medium text-amber-100/70 underline-offset-4 hover:text-white hover:underline"
              >
                Prohlédnout seznam
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="protokoly" className="border-t border-white/10 bg-[#100e0b] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Všechny protokoly</h2>
          <p className="mt-2 max-w-xl text-sm text-white/55">
            Otevřete detail — denní plán, suplementy, lab testy a nástroje.
          </p>

          <ol className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {LONGEVITY_PROTOCOLS.map((protocol) => (
              <li key={protocol.slug}>
                <Link
                  href={`/vip/protokoly/${protocol.slug}`}
                  className="group grid gap-2 py-6 transition hover:bg-white/[0.03] sm:grid-cols-[4.5rem_1fr_auto] sm:items-baseline sm:gap-6 sm:px-2"
                >
                  <span className="font-display text-2xl font-bold text-amber-400/75">
                    #{protocol.number.toString().padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white group-hover:text-amber-200 sm:text-xl">
                      {localizedText(protocol.title, "cs")}
                    </h3>
                    <p className="mt-1 text-sm text-white/55">
                      {localizedText(protocol.subtitle, "cs")}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-300/80 sm:justify-self-end">
                    {protocol.vipOnly ? "VIP" : "Zdarma"}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-2xl font-bold">VIP od {pricing.label}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
            Všechny protokoly, export PDF, MediFlow sync, bez reklam.
          </p>
          <Link
            href="/predplatne"
            className="mt-7 inline-flex items-center gap-2 bg-amber-400 px-7 py-3.5 text-sm font-semibold text-[#1a1005] transition hover:bg-amber-300"
          >
            Aktivovat VIP
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="mx-auto mt-10 flex max-w-2xl items-start gap-2 text-left text-xs text-white/40">
            <Shield className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {MEDICAL_DISCLAIMER.cs}
          </p>
        </div>
      </section>
    </div>
  );
}
