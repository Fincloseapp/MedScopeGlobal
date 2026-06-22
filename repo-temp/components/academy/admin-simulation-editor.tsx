"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminSimulationGraphEditor } from "@/components/academy/admin-simulation-graph-editor";
import type { SimulationDecision } from "@/components/academy/simulation-player";

type SimulationRow = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  status: string;
  scenario_json: Record<string, unknown>;
};

const SAMPLE_DECISION: SimulationDecision = {
  id: "node_1",
  prompt: "Jaký je váš první krok?",
  options: [
    { id: "opt_a", label: "Správná volba", score: 25, feedback: "Výborně.", next: null },
    { id: "opt_b", label: "Špatná volba", score: 0, feedback: "Zkuste znovu.", next: "node_1" },
  ],
};

function parseScenario(raw: Record<string, unknown>) {
  const decisions = Array.isArray(raw.decisions)
    ? (raw.decisions as SimulationDecision[])
    : [];
  const start_node = String(raw.start_node ?? decisions[0]?.id ?? "node_1");
  return { decisions, start_node, rest: { ...raw } };
}

export function AdminSimulationEditor({ simulation }: { simulation: SimulationRow }) {
  const initial = useMemo(
    () => parseScenario(simulation.scenario_json ?? {}),
    [simulation.scenario_json]
  );

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"visual" | "json">("visual");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [decisions, setDecisions] = useState(initial.decisions);
  const [startNode, setStartNode] = useState(initial.start_node);
  const [scenarioText, setScenarioText] = useState(
    JSON.stringify(simulation.scenario_json ?? {}, null, 2)
  );

  function syncFromVisual(next: { decisions: SimulationDecision[]; start_node: string }) {
    setDecisions(next.decisions);
    setStartNode(next.start_node);
    const merged = { ...initial.rest, start_node: next.start_node, decisions: next.decisions };
    setScenarioText(JSON.stringify(merged, null, 2));
  }

  function insertDecisionsTemplate() {
    const next = {
      ...initial.rest,
      start_node: "node_1",
      decisions: decisions.length ? decisions : [SAMPLE_DECISION],
    };
    setDecisions(next.decisions as SimulationDecision[]);
    setStartNode("node_1");
    setScenarioText(JSON.stringify(next, null, 2));
  }

  async function save() {
    setLoading(true);
    setStatus(null);
    try {
      const scenario_json =
        mode === "visual"
          ? { ...initial.rest, start_node: startNode, decisions }
          : (JSON.parse(scenarioText) as Record<string, unknown>);

      const res = await fetch(`/api/academy/simulations/${simulation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ scenario_json }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      setStatus("Uloženo.");
      setOpen(false);
      window.location.reload();
    } catch {
      setStatus("Neplatný JSON nebo síťová chyba.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          Upravit scénář
        </Button>
        <Link
          href={`/academy/ai-simulations/${simulation.slug}`}
          className="inline-flex items-center text-sm text-[#005B96] hover:underline"
        >
          Náhled
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[#021d33]">Scénář: {simulation.title}</p>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`rounded px-2 py-1 ${mode === "visual" ? "bg-[#005B96] text-white" : ""}`}
          >
            Graf editor
          </button>
          <button
            type="button"
            onClick={() => setMode("json")}
            className={`rounded px-2 py-1 ${mode === "json" ? "bg-[#005B96] text-white" : ""}`}
          >
            JSON
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <div className="mt-3">
          <AdminSimulationGraphEditor
            decisions={decisions}
            startNode={startNode}
            onChange={syncFromVisual}
          />
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={insertDecisionsTemplate}>
              Vložit šablonu decisions
            </Button>
          </div>
          <textarea
            value={scenarioText}
            onChange={(e) => setScenarioText(e.target.value)}
            className="mt-3 h-64 w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs"
            spellCheck={false}
          />
        </>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={save} disabled={loading}>
          {loading ? "Ukládám…" : "Uložit scénář"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
          Zrušit
        </Button>
        {status ? <span className="text-sm text-slate-600">{status}</span> : null}
      </div>
    </div>
  );
}
