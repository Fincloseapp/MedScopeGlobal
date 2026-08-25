import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Activity, Bookmark, Pill, StickyNote } from "lucide-react";
import { MEDIFLOW, appSeoDescription, appSeoTitle } from "@/lib/apps/catalog";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: appSeoTitle(MEDIFLOW),
  description: appSeoDescription(MEDIFLOW),
  path: "/mediflow",
});

const FEATURES = [
  { icon: Bookmark, title: "Uložení článků", description: "Ukládejte články z MedscopeGlobal magazínu pro pozdější čtení." },
  { icon: Activity, title: "Sledování symptomů", description: "Zaznamenávejte symptomy pro vlastní přehled — bez diagnostiky." },
  { icon: Pill, title: "Suplementy a protokoly", description: "Sledujte suplementy a VIP longevity protokoly." },
  { icon: StickyNote, title: "Poznámky", description: "Osobní wellness poznámky s offline podporou." },
];

export default function MediFlowMarketingPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#10b981]/20 px-4 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Veřejná wellness aplikace
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">MediFlow</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Váš osobní wellness deník. Ukládejte články, sledujte symptomy a suplementy.
            Bez diagnostiky — pro vlastní přehled a sdílení s lékařem.
          </p>
          <Link
            href="/app/mediflow"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 font-semibold text-black hover:bg-emerald-400"
          >
            Spustit MediFlow <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <f.icon className="h-8 w-8 text-emerald-600" />
              <h3 className="mt-3 font-semibold text-[#021d33]">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-50 px-4 py-12 text-center">
        <p className="text-sm text-emerald-800">
          MediFlow neslouží k diagnostice. Obsah není lékařská rada.
        </p>
        <Link href="/app/mediflow" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
          Vyzkoušet zdarma →
        </Link>
      </section>
    </>
  );
}
