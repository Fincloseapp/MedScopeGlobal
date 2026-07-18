import Link from "next/link";
import { CME_FOCUS_SPECIALTY } from "@/types/academy-b2b";

type Props = {
  /** Compact panel (hub pages) vs full homepage section */
  variant?: "section" | "panel";
  className?: string;
};

export function AccreditedCmeOverview({
  variant = "section",
  className = "",
}: Props) {
  const specialty = CME_FOCUS_SPECIALTY.label;

  if (variant === "panel") {
    return (
      <section
        id="obory"
        className={`border border-slate-200 bg-white px-6 py-8 ${className}`}
      >
        <p className="text-xs uppercase tracking-[0.16em] text-[#005B96]">
          Akreditované CME · {specialty}
        </p>
        <h2 className="mt-3 font-serif text-2xl tracking-tight text-[#021d33]">
          Akreditované testy v revmatologii
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          MedScope Academy nabízí akreditované CME výhradně pro obor{" "}
          <strong className="font-medium text-[#021d33]">{specialty}</strong> —
          video, závěrečný test a certifikát pro ČLK. Jiné obory zatím nejsou v
          nabídce.
        </p>
        <p className="mt-4 inline-flex border border-[#005B96] bg-[#f0f7ff] px-4 py-2.5 text-sm font-medium text-[#021d33]">
          {specialty} · testy k dispozici
        </p>
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
              Pro ověřené lékaře · ČLK · {specialty}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
              Akreditované CME testy v revmatologii
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Kurzy s videem, závěrečným testem a certifikátem pro ČLK — zaměřené
              výhradně na <strong className="font-medium text-[#021d33]">{specialty}</strong>.
              Jiné lékařské obory v této nabídce nejsou.
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

        <div className="mt-8 max-w-md border border-[#005B96]/30 bg-white px-5 py-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Obor v nabídce
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
            {specialty}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Akreditované testy a CME kurzy jsou připravené pro revmatology.
          </p>
          <Link
            href="/academy/lekari#katalog"
            className="mt-4 inline-block text-sm font-medium text-[#005B96] hover:underline"
          >
            Zobrazit katalog →
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Přístup po ověření evidenčního čísla ČLK (zákon o regulaci reklamy).
        </p>
      </div>
    </section>
  );
}
