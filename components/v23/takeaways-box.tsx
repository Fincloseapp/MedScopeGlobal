import { Lightbulb } from "lucide-react";

export function V23TakeawaysBox({
  title = "Co si odnést",
  points,
}: {
  title?: string;
  points: string[];
}) {
  if (!points.length) return null;

  return (
    <aside className="my-8 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-700" aria-hidden />
        <h2 className="font-display text-lg font-semibold text-amber-950">{title}</h2>
      </div>
      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex gap-2 text-sm leading-relaxed text-amber-950/90">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" aria-hidden />
            {p}
          </li>
        ))}
      </ul>
    </aside>
  );
}
