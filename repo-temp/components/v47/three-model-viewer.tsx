"use client";

type Props = {
  topic: string;
  spec?: { name?: string; primitives?: Array<{ type?: string; label?: string }> };
};

/** Three.js 3D model viewer stub — wire GLTF loader when assets are available. */
export function ThreeModelViewerStub({ topic, spec }: Props) {
  const primitives = spec?.primitives ?? [];
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-700">{spec?.name ?? topic}</p>
      <p className="mt-2 text-xs text-slate-500">3D viewer scaffold (v47)</p>
      {primitives.length > 0 ? (
        <ul className="mt-3 text-left text-xs text-slate-600">
          {primitives.slice(0, 5).map((p, i) => (
            <li key={i}>
              {p.type ?? "mesh"} — {p.label ?? "part"}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
