import { Quote } from "lucide-react";

const STATS = [
  { value: "500+", label: "Odborných článků" },
  { value: "2 800+", label: "Zdravotnických profesionálů a studentů medicíny" },
  { value: "120+", label: "Kurzů a simulací" },
  { value: "14 dní", label: "Zkušební verze zdarma" },
];

const TESTIMONIALS = [
  {
    quote:
      "MedScopeGlobal mi pomáhá rychle najít guidelines a studie v českém kontextu — ideální mezi pacienty.",
    author: "MUDr. Novák",
    role: "Praktický lékař, Praha",
  },
  {
    quote:
      "Kurzy pro přijímačky a AI tutor jsou pro mě nejlepší doplněk k doučování — strukturované a srozumitelné.",
    author: "Lucie K.",
    role: "Uchazečka o LF Praha",
  },
  {
    quote:
      "Konečně magazín, který respektuje odbornou hloubku i srozumitelnost pro laiky. Doporučuji kolegům.",
    author: "PhDr. Krejčí",
    role: "Klinický výzkumník, FN",
  },
];

export function SocialProofStrip({ isCs = true }: { isCs?: boolean }) {
  if (!isCs) {
    return (
      <section className="border-y border-[#dfeaf5] bg-white" aria-label="Platform stats">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl font-bold text-[#005B96]">{s.value}</p>
                <p className="mt-1 text-sm text-slate-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-[#dfeaf5] bg-white" aria-label="Reference a statistiky">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
          Proč MedScopeGlobal
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-semibold text-[#021d33]">
          Důvěřují nám studenti, lékaři a výzkumníci
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[#cfe1f3] bg-[#f8fbff] px-4 py-5 text-center"
            >
              <p className="font-display text-2xl font-bold text-[#005B96]">{s.value}</p>
              <p className="mt-1 text-sm text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.author}
              className="rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-sm"
            >
              <Quote className="h-5 w-5 text-[#005B96]/40" aria-hidden />
              <blockquote className="mt-2 text-sm leading-relaxed text-slate-700">
                „{t.quote}"
              </blockquote>
              <figcaption className="mt-4 text-xs text-slate-500">
                <span className="font-semibold text-[#021d33]">{t.author}</span>
                <span className="block">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
