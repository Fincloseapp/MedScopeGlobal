import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";
import { OrdiZapisMark } from "@/components/lekari/ordizapis-mark";
import { ORDIZAPIS } from "@/lib/lekari/dokumentace/branding";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";
import { getV27AudienceHubCopy } from "@/lib/i18n/v27-audience-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { chromePack } from "@/lib/i18n/chrome-pack";

export async function OrdiZapisPromoBanner({
  variant = "homepage",
}: {
  variant?: "homepage" | "hub";
}) {
  const locale = await getServerLocale();
  const surface = getSurfaceCopy(locale);
  const physician = getV27AudienceHubCopy("physician", locale);
  const cs = chromePack(locale) === "cs";
  const physicianAudience = surface.audiences.find((item) => item.id === "physician");
  const tagline = surface.appTaglines.ordizapis;
  const pitch = cs ? ORDIZAPIS.pitch : physicianAudience?.description ?? tagline;
  const primary = cs ? "Stáhnout a nahrávat" : physicianAudience?.ctaPrimary ?? physician.enter;
  const secondary = cs ? "Jak to funguje" : physicianAudience?.ctaSecondary ?? physician.enter;

  return (
    <section
      className={
        variant === "homepage"
          ? "border-b border-[#cfe1f3] bg-[#021d33]"
          : "rounded-2xl border border-[#005B96]/25 bg-[#021d33]"
      }
      aria-label={`${ORDIZAPIS.shortName} · ${physician.shortLabel}`}
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
            <OrdiZapisMark size="md" priority className="shrink-0 rounded-[22%] ring-2 ring-white/20" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                {physician.shortLabel} · {ORDIZAPIS.domain}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
                {ORDIZAPIS.shortName}
                <span className="font-semibold text-sky-200"> — {tagline}</span>
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-sky-100/90">{pitch}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            <Link
              href={localizePublicHref(ORDIZAPIS.routes.app, locale)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#021d33] hover:bg-sky-50"
            >
              <Mic className="h-4 w-4 text-[#005B96]" />
              {primary}
            </Link>
            <Link
              href={localizePublicHref(ORDIZAPIS.routes.marketing, locale)}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-white/35 px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {secondary}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
