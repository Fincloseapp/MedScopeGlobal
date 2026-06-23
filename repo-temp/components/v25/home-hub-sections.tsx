import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { V25_HOME_HUBS } from "@/lib/v25/home-hubs";

export function V25HomeHubSections() {
  return (
    <section className="border-b border-slate-200 bg-white" aria-labelledby="v25-hub-heading">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            Rychlý přístup
          </p>
          <h2 id="v25-hub-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
            Veřejnost, studenti a odborníci
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Přehledné vstupy do hlavních sekcí — od prevence pro laiky po ověřený obsah pro lékaře.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {V25_HOME_HUBS.map((hub) => (
            <Link
              key={hub.id}
              href={hub.href}
              prefetch
              className="group flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-md"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{hub.eyebrow}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33] group-hover:text-primary">
                {hub.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{hub.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {hub.links.map((link) => (
                  <span
                    key={link}
                    className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200"
                  >
                    {link}
                  </span>
                ))}
              </div>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                {hub.cta}
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
