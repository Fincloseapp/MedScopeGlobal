"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

export function AdminSimulationEditor({ simulation }: { simulation: SimulationRow }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [scenarioText, setScenarioText] = useState(
    JSON.stringify(simulation.scenario_json ?? {}, null, 2)
  );

  function insertDecisionsTemplate() {
    try {
      const current = JSON.parse(scenarioText) as Record<string, unknown>;
      const next = {
        ...current,
        start_node: "node_1",
        decisions: current.decisions ?? [SAMPLE_DECISION],
      };
      setScenarioText(JSON.stringify(next, null, 2));
    } catch {
      setScenarioText(
        JSON.stringify({ start_node: "node_1", decisions: [SAMPLE_DECISION] }, null, 2)
      );
    }
  }

  async function save() {
    setLoading(true);
    setStatus(null);
    try {
      const scenario_json = JSON.parse(scenarioText) as Record<string, unknown>;
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
      <p className="text-sm font-medium text-[#021d33]">
        Scénář: {simulation.title} — <code className="text-xs">scenario_json</code>
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Pole <code>decisions</code> definuje větvení; <code>start_node</code> je počáteční uzel.
      </p>
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
