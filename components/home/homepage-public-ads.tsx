import { MeDipacientPromoBanner } from "@/components/medipacient/medipacient-promo-banner";
import { MEDIPACIENT } from "@/lib/medipacient/branding";

export function HomepagePublicAds() {
  return (
    <section
      className="border-b border-[#2D7FF9]/20 bg-[#021d33]"
      aria-labelledby="hp-public-ads-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
          Pro veřejnost
        </p>
        <h2
          id="hp-public-ads-heading"
          className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl"
        >
          {MEDIPACIENT.headline}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-sky-100/80">
          {MEDIPACIENT.shortName} od {MEDIPACIENT.provider} — {MEDIPACIENT.tagline} Nainstalujete z
          prohlížeče na plochu telefonu i počítače.
        </p>
        <div className="mt-5">
          <MeDipacientPromoBanner variant="hub" />
        </div>
      </div>
    </section>
  );
}
