import Link from "next/link";
import { MEDICAL_SPECIALIZATIONS } from "@/types/academy-b2b";

type Props = {
  /** Compact panel (hub pages) vs full homepage section */
  variant?: "section" | "panel";
  /** Highlight physician's own specialization when known */
  activeSpecialization?: string | null;
  className?: string;
};

export function AccreditedCmeOverview({
  variant = "section",
  activeSpecialization = null,
  className = "",
}: Props) {
  const specialties = MEDICAL_SPECIALIZATIONS.filter((s) => s.value !== "ostatni");

  if (variant === "panel") {
    return (
      <section
        id="obory"
        className={`border border-slate-200 bg-white px-6 py-8 ${className}`}
      >
        <p className="text-xs uppercase tracking-[0.16em] text-[#005B96]">
          Akreditované CME testy · k dispozici
        </p>
        <h2 className="mt-3 font-serif text-2xl tracking-tight text-[#021d33]">
          Obory, ve kterých můžete skládat testy
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Po ověření ČLK získáte přístup k akreditovaným kurzům s videem, kvízem a
          certifikátem pro ČLK. Testy pokrývají tyto lékařské obory:
        </p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((s) => {
            const active = activeSpecialization === s.value;
            return (
              <li
                key={s.value}
                className={
                  active
                    ? "border border-[#005B96] bg-[#f0f7ff] px-3 py-2.5 text-sm font-medium text-[#021d33]"
                    : "border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                }
              >
                {s.label}
                {active ? (
                  <span className="ml-2 text-xs font-normal text-[#005B96]">
                    váš obor
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/academy/lekari/overeni"
            className="bg-[#005B96] px-4 py-2.5 text-sm font-medium text-white"
          >
            Ověřit ČLK a spustit testy
          </Link>
          <Link
            href="/academy/lekari"
            className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-[#021d33]"
          >
            Otevřít Lékařskou zónu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      id="akreditovane-cme"
      className={`border-b border-slate-200 bg-[linear-gradient(180deg,#f0f7ff_0%,#ffffff_70%)] ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
              Pro ověřené lékaře · ČLK
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
              Akreditované CME testy jsou k dispozici
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Turn-key kurzy s videem, závěrečným testem a certifikátem pro hromadný
              upload do ČLK. Přehled oborů, ve kterých můžete skládat akreditované
              testy:
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/academy/lekari"
              className="bg-[#005B96] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#004a7a]"
            >
              Lékařská zóna →
            </Link>
            <Link
              href="/academy/lekari/overeni"
              className="border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-[#021d33]"
            >
              Ověřit ČLK
            </Link>
          </div>
        </div>

        <ul className="mt-8 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {specialties.map((s) => (
            <li key={s.value}>
              <Link
                href={`/academy/lekari#obory`}
                className="flex h-full items-center border border-slate-200 bg-white px-3 py-3 text-sm text-[#021d33] transition hover:border-[#005B96]/40 hover:bg-[#f8fafc]"
              >
                <span className="mr-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#005B96]" />
                {s.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-slate-500">
          Přístup po ověření evidenčního čísla ČLK (zákon o regulaci reklamy).{" "}
          <Link href="/academy/lekari" className="font-medium text-[#005B96] hover:underline">
            Zobrazit katalog akreditovaných kurzů
          </Link>
        </p>
      </div>
    </section>
  );
}
