export function V23TakeawaysBox({ points }: { points: string[] }) {
  if (!points.length) return null;

  return (
    <aside className="mt-8 rounded-2xl border border-[#cfe1f3] bg-[#f0f7ff] p-5">
      <h2 className="font-display text-lg font-semibold text-[#021d33]">Klíčové body</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </aside>
  );
}
