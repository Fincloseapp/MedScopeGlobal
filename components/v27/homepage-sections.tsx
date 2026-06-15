import Link from "next/link";
import { V27AudienceGrid } from "@/components/v27/audience-hub-section";
import { V27_AUDIENCES } from "@/lib/v27/config";
import { getSiteVersionLabel } from "@/lib/v27/version";

export function V27HomepageSections() {
  const version = getSiteVersionLabel();

  return (
    <>
      <section className="border-y border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                {version} · Kompletní webová transformace
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
                Vyberte si svou cestu ve zdravotnictví
              </h2>
            </div>
            <Link
              href="/predplatne"
              className="rounded-full border border-[#005B96]/30 px-4 py-2 text-sm font-medium text-[#005B96] hover:bg-[#005B96]/5"
            >
              Ceník a předplatné →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {(["public", "student", "physician"] as const).map((key) => {
              const cfg = V27_AUDIENCES[key];
              return (
                <Link
                  key={key}
                  href={cfg.href}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#005B96]/40 hover:shadow-md"
                >
                  <p className="font-semibold text-[#021d33]">{cfg.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{cfg.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#005B96]/10 px-3 py-1 text-xs font-medium text-[#005B96]">
                      {cfg.ctaPrimary.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {cfg.ctaSecondary.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <V27AudienceGrid />

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="rounded-3xl border border-[#005B96]/15 bg-[#005B96]/5 px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
                Pro firmy
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold text-[#021d33]">
                Pharma, kliniky, laboratoře a univerzity
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Reklamní formáty, sponzorované články a segmentace publika.
              </p>
            </div>
            <Link
              href="/pro-firmy"
              className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
            >
              B2B nabídka
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
