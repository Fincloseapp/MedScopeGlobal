"use client";

import { Button } from "@/components/ui/button";
import type { SimulationDecision } from "@/components/academy/simulation-player";

type Props = {
  decisions: SimulationDecision[];
  startNode: string;
  onChange: (next: { decisions: SimulationDecision[]; start_node: string }) => void;
};

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function AdminSimulationGraphEditor({ decisions, startNode, onChange }: Props) {
  function updateDecision(index: number, patch: Partial<SimulationDecision>) {
    const next = decisions.map((d, i) => (i === index ? { ...d, ...patch } : d));
    onChange({ decisions: next, start_node: startNode });
  }

  function updateOption(di: number, oi: number, field: string, value: string | number | null) {
    const next = decisions.map((d, i) => {
      if (i !== di) return d;
      const options = d.options.map((o, j) =>
        j === oi ? { ...o, [field]: value } : o
      );
      return { ...d, options };
    });
    onChange({ decisions: next, start_node: startNode });
  }

  function addDecision() {
    const id = newId("node");
    const next: SimulationDecision = {
      id,
      prompt: "Nová otázka",
      options: [{ id: newId("opt"), label: "Možnost A", score: 10, feedback: "", next: null }],
    };
    onChange({
      decisions: [...decisions, next],
      start_node: startNode || id,
    });
  }

  function removeDecision(index: number) {
    const removed = decisions[index]?.id;
    const next = decisions.filter((_, i) => i !== index);
    const nextStart =
      startNode === removed ? (next[0]?.id ?? "") : startNode;
    onChange({ decisions: next, start_node: nextStart });
  }

  function addOption(di: number) {
    const next = decisions.map((d, i) => {
      if (i !== di) return d;
      return {
        ...d,
        options: [
          ...d.options,
          { id: newId("opt"), label: "Nová možnost", score: 0, feedback: "", next: null },
        ],
      };
    });
    onChange({ decisions: next, start_node: startNode });
  }

  const nodeIds = decisions.map((d) => d.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-slate-600">
          Startovní uzel
          <select
            value={startNode}
            onChange={(e) => onChange({ decisions, start_node: e.target.value })}
            className="ml-2 rounded border border-slate-200 px-2 py-1 text-sm"
          >
            {decisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" size="sm" variant="outline" onClick={addDecision}>
          + Uzel rozhodnutí
        </Button>
      </div>

      {decisions.length === 0 ? (
        <p className="text-sm text-slate-500">Zatím žádné uzly — přidejte první rozhodnutí.</p>
      ) : null}

      {decisions.map((decision, di) => (
        <div key={decision.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <input
                value={decision.id}
                onChange={(e) => updateDecision(di, { id: e.target.value })}
                className="w-32 rounded border border-slate-200 px-2 py-1 font-mono text-xs"
                aria-label="ID uzlu"
              />
              <input
                value={decision.prompt}
                onChange={(e) => updateDecision(di, { prompt: e.target.value })}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                placeholder="Text otázky / situace"
              />
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => removeDecision(di)}>
              Odstranit uzel
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium uppercase text-slate-500">Možnosti</p>
            {decision.options.map((opt, oi) => (
              <div
                key={opt.id}
                className="grid gap-2 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2"
              >
                <input
                  value={opt.label}
                  onChange={(e) => updateOption(di, oi, "label", e.target.value)}
                  className="rounded border border-slate-200 px-2 py-1 text-sm"
                  placeholder="Popisek možnosti"
                />
                <input
                  type="number"
                  value={opt.score}
                  onChange={(e) => updateOption(di, oi, "score", Number(e.target.value))}
                  className="rounded border border-slate-200 px-2 py-1 text-sm"
                  placeholder="Skóre"
                />
                <input
                  value={opt.feedback ?? ""}
                  onChange={(e) => updateOption(di, oi, "feedback", e.target.value)}
                  className="rounded border border-slate-200 px-2 py-1 text-sm sm:col-span-2"
                  placeholder="Zpětná vazba"
                />
                <select
                  value={opt.next ?? ""}
                  onChange={(e) =>
                    updateOption(di, oi, "next", e.target.value || null)
                  }
                  className="rounded border border-slate-200 px-2 py-1 text-sm sm:col-span-2"
                >
                  <option value="">— Konec simulace —</option>
                  {nodeIds
                    .filter((id) => id !== decision.id)
                    .map((id) => (
                      <option key={id} value={id}>
                        → {id}
                      </option>
                    ))}
                </select>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => addOption(di)}>
              + Možnost
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
