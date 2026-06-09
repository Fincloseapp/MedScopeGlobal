import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { V23_STUDY_PLANS } from "@/lib/v23/medicina-plans";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Studijní plány",
  description: "Strukturované plány pro přípravu na LF a studium 1.–6. ročníku.",
};

export default function MedicinaPlanyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href="/medicina" className="text-sm font-medium text-primary hover:underline">
        ← Studium medicíny
      </Link>
      <header className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Studijní plány</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">Plány a harmonogramy</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Týdenní struktura pro přípravu na přijímačky a první ročník — s odkazy na kvízy a zdroje.
        </p>
      </header>

      <div className="mt-10 grid gap-8">
        {V23_STUDY_PLANS.map((plan) => (
          <article
            key={plan.slug}
            id={plan.slug}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="grid lg:grid-cols-[280px_1fr]">
              <div className="relative aspect-[16/10] bg-slate-100 lg:aspect-auto lg:min-h-[200px]">
                <Image
                  src={plan.imageUrl}
                  alt={plan.title}
                  fill
                  className="object-cover"
                  sizes="280px"
                  loading="lazy"
                />
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {plan.duration} · {plan.audience}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">{plan.title}</h2>
                <div className="mt-6 space-y-4">
                  {plan.weeks.map((w) => (
                    <div key={w.week} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                      <p className="text-sm font-semibold text-[#021d33]">
                        Týden {w.week}: {w.focus}
                      </p>
                      <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                        {w.tasks.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {plan.resources.map((r) => (
                    <Link
                      key={r.href}
                      href={r.href}
                      prefetch
                      className="rounded-full border border-primary/30 px-3 py-1 text-sm text-primary hover:bg-primary/5"
                    >
                      {r.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
