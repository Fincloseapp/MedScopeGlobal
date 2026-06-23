import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { V23_AUDIENCE_PRIORITIES } from "@/lib/v23/homepage";

export function V23AudiencePriorities() {
  return (
    <section className="border-b border-slate-200 bg-slate-50" aria-labelledby="v23-audience-heading">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Pro koho</p>
          <h2 id="v23-audience-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
            Obsah podle vaší role
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Přehledné vstupy do sekcí — od klinické praxe po přípravu na LF.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {V23_AUDIENCE_PRIORITIES.map((a) => (
            <Link
              key={a.id}
              href={a.href}
              prefetch
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <h3 className="font-display text-lg font-semibold text-[#021d33] group-hover:text-primary">
                {a.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{a.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                {a.cta}
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
