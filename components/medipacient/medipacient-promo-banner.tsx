import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { MeDipacientMark } from "@/components/medipacient/medipacient-mark";
import { MeDipacientMarketingInfographic } from "@/components/medipacient/medipacient-marketing-infographic";
import { MEDIPACIENT } from "@/lib/medipacient/branding";

export function MeDipacientPromoBanner({
  variant = "homepage",
}: {
  variant?: "homepage" | "hub";
}) {
  return (
    <section
      className={
        variant === "homepage"
          ? "border-b border-[#2D7FF9]/25 bg-[#021d33]"
          : "rounded-2xl border border-[#2D7FF9]/25 bg-[#021d33]"
      }
      aria-label={`${MEDIPACIENT.shortName} od ${MEDIPACIENT.provider}`}
    >
      <div
        className={
          variant === "homepage"
            ? "relative overflow-hidden mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7"
            : "relative overflow-hidden px-4 py-5 sm:px-6"
        }
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_0%,rgba(45,127,249,0.28),transparent_45%),radial-gradient(ellipse_at_10%_80%,rgba(74,222,128,0.12),transparent_40%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <MeDipacientMark size="md" className="mt-0.5 shrink-0 rounded-[22%] ring-2 ring-white/20 sm:mt-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                Od {MEDIPACIENT.provider} · pro veřejnost
              </p>
              <p className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
                {MEDIPACIENT.shortName}
                <span className="font-semibold text-[#93c5fd]"> – {MEDIPACIENT.headline}</span>
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-sky-100/90">{MEDIPACIENT.pitch}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <MeDipacientMarketingInfographic variant="banner" />
            <Link
              href={MEDIPACIENT.routes.download}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#2D7FF9] px-5 text-sm font-semibold text-white hover:bg-[#1f6ae0]"
            >
              <Download className="h-4 w-4" />
              Stáhnout MeDipacient
            </Link>
            <a
              href={MEDIPACIENT.installUrl}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-white/35 px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Otevřít aplikaci
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
