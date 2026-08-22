import Link from "next/link";
import { Download } from "lucide-react";
import { MEDIPACIENT } from "@/lib/medipacient/branding";

export const MEDIPACIENT_MARKETING_ALT =
  "MeDipacient — nahrání zprávy, AI přehled a připomínky v telefonu.";

const PANELS = [
  {
    headline: "Po vyšetření si nahrajete zprávu.",
    button: "Nahrát zprávu",
  },
  {
    headline: "AI zprávu přečte, vyhodnotí a uloží.",
  },
  {
    headline: "Už nikdy nezapomeňte.",
    labels: [
      "Vyšetření 12. 5.",
      "Doporučení 15. 5.",
      "Kontrola 28. 5.",
      "Laboratoř 5. 6.",
      "Další krok 12. 7.",
    ],
  },
  {
    headline: "Všechny vaše zprávy na jednom místě.",
    button: "Nahrát zprávu",
  },
  {
    headline: "Jednoduché pro každého. Od studentů po seniory.",
  },
  {
    headline: "Premium vám hlídá zdraví. Vy jen žijete.",
    free: ["Nahrávání zpráv", "Základní analýza", "Základní připomínky"],
    premium: ["Pokročilá analýza", "Chytré připomínky", "Lékový plán", "Prioritní péče"],
  },
] as const;

type Variant = "full" | "compact" | "banner";

export function MeDipacientMarketingInfographic({
  variant = "full",
  priority = false,
  className,
}: {
  variant?: Variant;
  priority?: boolean;
  className?: string;
}) {
  if (variant === "banner") {
    return (
      <Link
        href={MEDIPACIENT.routes.download}
        className={`group relative hidden overflow-hidden rounded-xl ring-1 ring-white/20 lg:block ${className ?? "h-[88px] w-[168px] shrink-0"}`}
      >
        {/* Native img: OpenNext/Cloudflare /_next/image optimizer 500s on /assets. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MEDIPACIENT.assets.marketing}
          alt={MEDIPACIENT_MARKETING_ALT}
          width={1536}
          height={1024}
          className="h-full w-full object-cover object-center transition group-hover:scale-[1.03]"
        />
        <span className="absolute inset-x-0 bottom-0 bg-[#021d33]/80 px-2 py-1 text-center text-[10px] font-semibold text-white">
          Stáhnout MeDipacient
        </span>
      </Link>
    );
  }

  const showDetails = variant === "full";

  return (
    <figure className={className ?? "mt-8 w-full max-w-5xl"}>
      <div className="overflow-hidden rounded-2xl border border-[#2D7FF9]/20 bg-white shadow-sm">
        {/* Native img: OpenNext/Cloudflare /_next/image optimizer 500s on /assets. Captions stay below so all 6 panels stay visible. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MEDIPACIENT.assets.marketing}
          alt={MEDIPACIENT_MARKETING_ALT}
          width={1536}
          height={1024}
          className="block h-auto w-full max-w-full object-contain object-center contrast-[1.06] saturate-[1.08]"
          {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
        />

        <ol className="grid gap-2 border-t border-slate-100 bg-[#F5F7FA] p-3 sm:grid-cols-2 md:grid-cols-3 md:gap-3 md:p-4">
          {PANELS.map((panel, index) => (
            <li
              key={panel.headline}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2D7FF9]">
                {index + 1} / 6
              </p>
              <p className="mt-1 text-sm font-semibold leading-5 text-[#1B1F23]">{panel.headline}</p>
              {"button" in panel && panel.button ? (
                <p className="mt-1.5 inline-flex rounded-full bg-[#2D7FF9] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {panel.button}
                </p>
              ) : null}
              {showDetails && "labels" in panel && panel.labels ? (
                <ul className="mt-2 space-y-0.5 text-[11px] leading-4 text-slate-600">
                  {panel.labels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              ) : null}
              {showDetails && "free" in panel && panel.free ? (
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] leading-4">
                  <div>
                    <p className="font-semibold text-[#2D7FF9]">ZDARMA</p>
                    <ul className="mt-1 space-y-0.5 text-slate-600">
                      {panel.free.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-[#021d33]">PREMIUM</p>
                    <ul className="mt-1 space-y-0.5 text-slate-600">
                      {panel.premium.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={MEDIPACIENT.routes.download}
          className="inline-flex h-11 items-center rounded-full bg-[#2D7FF9] px-5 text-sm font-semibold text-white hover:bg-[#1f6ae0]"
        >
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Stáhnout MeDipacient
        </Link>
        <figcaption className="text-xs leading-5 text-slate-500">
          Vzdělávací přehled zpráv — nenahrazuje lékařskou péči.
        </figcaption>
      </div>
    </figure>
  );
}
