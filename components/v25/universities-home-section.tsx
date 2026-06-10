import Link from "next/link";
import { listUniversitiesForUiAsync } from "@/lib/v25/universities";
import { CZ_MEDICAL_FACULTIES } from "@/lib/v25/universities-data";

export async function V25UniversitiesHomeSection() {
  const faculties = await listUniversitiesForUiAsync();
  const shortBySlug = new Map(CZ_MEDICAL_FACULTIES.map((f) => [f.slug, f.shortName]));

  return (
    <section className="border-y border-slate-200 bg-[#f7fbff]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              v25.1 — české LF
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
              Lékařské fakulty v ČR
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Přehled všech 8 lékařských fakult — přijímačky, oficiální weby a aktuální stav sběru dat.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/studium/univerzity"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Všechny fakulty →
            </Link>
            <Link
              href="/studium/prijimacky"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#021d33] hover:bg-slate-50"
            >
              Přijímačky
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {faculties.map((f) => (
            <Link
              key={f.slug}
              href={`/studium/univerzity/${f.slug}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-primary/40 hover:shadow-sm"
            >
              <p className="font-semibold text-[#021d33]">{shortBySlug.get(f.slug) ?? f.name}</p>
              <p className="text-xs text-muted-foreground">{f.city}</p>
              {f.ok === true ? (
                <span className="mt-2 inline-block text-[10px] font-medium uppercase text-emerald-700">
                  Web OK
                </span>
              ) : f.ok === false ? (
                <span className="mt-2 inline-block text-[10px] font-medium uppercase text-amber-700">
                  Kontrola selhala
                </span>
              ) : (
                <span className="mt-2 inline-block text-[10px] font-medium uppercase text-slate-500">
                  Katalog
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
