import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";
import { MediktorMark } from "@/components/lekari/mediktor-mark";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";

export function MediktorPromoBanner({
  variant = "homepage",
}: {
  variant?: "homepage" | "hub";
}) {
  return (
    <section
      className={
        variant === "homepage"
          ? "border-b border-[#cfe1f3] bg-[#021d33]"
          : "rounded-2xl border border-[#005B96]/25 bg-[#021d33]"
      }
      aria-label={`${MEDIKTOR.shortName} pro lékaře`}
    >
      <div
        className={
          variant === "homepage"
            ? "relative overflow-hidden mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6"
            : "relative overflow-hidden px-4 py-5 sm:px-6"
        }
      >
        <div className="pointer-events-none absolute inset-0 bg-sky-900/30" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
            <MediktorMark size="md" priority className="shrink-0 rounded-[22%] ring-2 ring-white/20" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                Pro lékaře · {MEDIKTOR.domain}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
                {MEDIKTOR.shortName}
                <span className="font-semibold text-sky-200"> — {MEDIKTOR.tagline}</span>
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-sky-100/90">
                {MEDIKTOR.pitch}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            <Link
              href={MEDIKTOR.routes.app}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#021d33] hover:bg-sky-50"
            >
              <Mic className="h-4 w-4 text-[#005B96]" />
              Stáhnout a nahrávat
            </Link>
            <Link
              href={MEDIKTOR.routes.marketing}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-white/35 px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Jak to funguje
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}