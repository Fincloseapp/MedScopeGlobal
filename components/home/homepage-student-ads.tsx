import { MeDiprepPromoBanner } from "@/components/prep/mediprep-promo-banner";
import { HomepageStudentSponsored } from "@/components/home/homepage-student-sponsored";
import { MEDIPREP } from "@/lib/prep/branding";

export function HomepageStudentAds() {
  return (
    <section
      className="border-b border-[#0A192F]/10 bg-[#0A192F]"
      aria-labelledby="hp-student-ads-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-lime-300">
          Pro studenty
        </p>
        <h2
          id="hp-student-ads-heading"
          className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl"
        >
          {MEDIPREP.headline}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-sky-100/80">
          {MEDIPREP.shortName} od {MEDIPREP.provider} — {MEDIPREP.socialLine} Originální testy B/C/F a simulace 8 českých LF.
        </p>
        <div className="mt-5">
          <MeDiprepPromoBanner variant="hub" />
        </div>
        <HomepageStudentSponsored />
      </div>
    </section>
  );
}
