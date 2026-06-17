"use client";

import { useState } from "react";
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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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

  function moveDecision(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= decisions.length) return;
    const next = [...decisions];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange({ decisions: next, start_node: startNode });
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

  function toggleCollapse(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
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

      {decisions.length > 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3">
          <p className="text-xs font-medium uppercase text-slate-500">Přehled toku</p>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
            {decisions.map((d, i) => (
              <span key={d.id} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleCollapse(d.id)}
                  className={`rounded-full px-2 py-0.5 ${
                    d.id === startNode
                      ? "bg-[#005B96] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {d.id}
                </button>
                {i < decisions.length - 1 ? <span className="text-slate-400">→</span> : null}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {decisions.length === 0 ? (
        <p className="text-sm text-slate-500">Zatím žádné uzly — přidejte první rozhodnutí.</p>
      ) : null}

      {decisions.map((decision, di) => {
        const isCollapsed = collapsed[decision.id];
        return (
          <div key={decision.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-1 flex-wrap items-start gap-2">
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    onClick={() => moveDecision(di, -1)}
                    disabled={di === 0}
                    aria-label="Posunout nahoru"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    onClick={() => moveDecision(di, 1)}
                    disabled={di === decisions.length - 1}
                    aria-label="Posunout dolů"
                  >
                    ↓
                  </Button>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={decision.id}
                      onChange={(e) => updateDecision(di, { id: e.target.value })}
                      className="w-32 rounded border border-slate-200 px-2 py-1 font-mono text-xs"
                      aria-label="ID uzlu"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCollapse(decision.id)}
                    >
                      {isCollapsed ? "Rozbalit" : "Sbalit"}
                    </Button>
                  </div>
                  {!isCollapsed ? (
                    <input
                      value={decision.prompt}
                      onChange={(e) => updateDecision(di, { prompt: e.target.value })}
                      className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Text otázky / situace"
                    />
                  ) : (
                    <p className="truncate text-sm text-slate-600">{decision.prompt}</p>
                  )}
                </div>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => removeDecision(di)}>
                Odstranit
              </Button>
            </div>

            {!isCollapsed ? (
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
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
