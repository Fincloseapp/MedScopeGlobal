import { CURATED_GUIDELINES } from "@/lib/lekari/curated-guidelines";

export function CuratedGuidelinesList({
  heading = "Doporučení s DOI — mimo revmatologii",
}: {
  heading?: string;
}) {
  return (
    <section className="mt-10 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
        Primární zdroje
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">{heading}</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        Tři živé guidelines s DOI. Nejsou to AI shrnutí a nenahrazují ČLS JEP ani protokol vaší
        nemocnice.
      </p>
      <ul className="mt-6 space-y-4">
        {CURATED_GUIDELINES.map((item) => (
          <li key={item.id} className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">
              {item.specialty} · {item.year}
            </p>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block font-display text-lg font-semibold text-[#021d33] hover:underline"
            >
              {item.title}
            </a>
            <p className="mt-1 text-sm text-slate-500">
              {item.source} · DOI {item.doi}
            </p>
            <p className="mt-2 text-sm text-slate-700">{item.use}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
