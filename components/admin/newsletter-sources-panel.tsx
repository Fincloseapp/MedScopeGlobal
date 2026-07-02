import type { V23NewsletterSources } from "@/lib/v23/newsletter/sources";

const SECTIONS: { key: keyof Omit<V23NewsletterSources, "pendingTopics">; label: string }[] = [
  { key: "studies", label: "Studie" },
  { key: "articles", label: "Články" },
  { key: "legislation", label: "Legislativa" },
  { key: "digitalHealth", label: "Digital Health" },
  { key: "drugs", label: "Léky" },
  { key: "universities", label: "Univerzity" },
];

export function NewsletterSourcesPanel({ sources }: { sources: V23NewsletterSources }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-display text-lg font-bold text-[#021d33]">Zdroje pro příští vydání</h2>
      <p className="mt-1 text-sm text-slate-600">Reálný obsah, který engine zapracuje do newsletteru.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <h3 className="text-sm font-semibold text-[#021d33]">
              {label}{" "}
              <span className="font-normal text-slate-500">({sources[key].length})</span>
            </h3>
            <ul className="mt-2 space-y-2 text-xs text-slate-600">
              {sources[key].length === 0 ? (
                <li className="text-amber-700">Použije se český fallback</li>
              ) : (
                sources[key].slice(0, 4).map((item, i) => (
                  <li key={`${key}-${i}`} className="line-clamp-2">
                    {item.title}
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
