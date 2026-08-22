import Image from "next/image";
import Link from "next/link";
import { MEDIPREP } from "@/lib/prep/branding";
import { MeDiprepInstallButton } from "@/components/prep/mediprep-install-button";

export function MeDiprepPromoBanner({
  variant = "homepage",
}: {
  variant?: "homepage" | "hub";
}) {
  return (
    <section
      className={
        variant === "homepage"
          ? "border-b border-cyan-900/30 bg-[#0A192F]"
          : "rounded-2xl border border-cyan-400/20 bg-[#0A192F]"
      }
      aria-label={`${MEDIPREP.shortName} od ${MEDIPREP.provider}`}
    >
      <div
        className={
          variant === "homepage"
            ? "relative overflow-hidden mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7"
            : "relative overflow-hidden px-4 py-5 sm:px-6"
        }
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_0%,rgba(34,211,238,0.22),transparent_45%),radial-gradient(ellipse_at_10%_80%,rgba(163,230,53,0.12),transparent_40%)]"
          aria-hidden
        />
        <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Od {MEDIPREP.provider} · pro studenty
              </p>
              <p className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
                {MEDIPREP.shortName}
                <span className="font-semibold text-lime-300"> – {MEDIPREP.headline}</span>
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-sky-100/90">
                {MEDIPREP.socialLine} {MEDIPREP.heroSupport}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              <MeDiprepInstallButton
                variant="hero"
                tone="light"
                className="h-11 min-w-0 bg-[#F97316] px-5 text-sm hover:bg-[#ea6a0c] sm:min-w-0"
              />
              <Link
                href={MEDIPREP.routes.app}
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/35 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Jen v prohlížeči
              </Link>
            </div>
          </div>

          <Link
            href={MEDIPREP.routes.marketing}
            className="relative hidden overflow-hidden rounded-xl border border-cyan-200/20 bg-[#07111F] shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)] md:block"
          >
            <Image
              src={MEDIPREP.assets.banner}
              alt={`${MEDIPREP.shortName} – ${MEDIPREP.headline}`}
              width={1920}
              height={600}
              className="h-auto w-full object-contain object-center"
              priority={variant === "homepage"}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
