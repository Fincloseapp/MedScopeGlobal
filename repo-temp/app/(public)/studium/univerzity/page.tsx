import Link from "next/link";
import type { Metadata } from "next";
import { listUniversitiesForUiAsync } from "@/lib/v25/universities";

export const metadata: Metadata = {
  title: "Lékařské fakulty v ČR",
  description: "Přehled všech českých lékařských fakult — UK, MU, UP, OU a další.",
};

export const dynamic = "force-dynamic";

export default async function UniverzityPage() {
  const faculties = await listUniversitiesForUiAsync();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <Link href="/studium" className="hover:text-foreground">
          Studium
        </Link>
        <span className="mx-2">/</span>
        <span>Univerzity</span>
      </nav>

      <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-6">
        <h1 className="font-display text-4xl font-bold text-[#021d33]">Lékařské fakulty</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Všechny české lékařské fakulty — odkazy, město a stav posledního sběru dat z oficiálních webů.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {faculties.map((f) => (
          <article key={f.slug} className="rounded-2xl border bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#021d33]">
                  <Link href={`/studium/univerzity/${f.slug}`} className="hover:text-primary">
                    {f.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{f.city}</p>
              </div>
              {f.ok === true ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  OK
                </span>
              ) : f.ok === false ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                  Nedostupné
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Katalog
                </span>
              )}
            </div>
            {f.description ? (
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{f.description}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link
                href={`/studium/univerzity/${f.slug}`}
                className="rounded-full border px-3 py-1 hover:bg-muted"
              >
                Detail
              </Link>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border px-3 py-1 hover:bg-muted"
              >
                Oficiální web →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
