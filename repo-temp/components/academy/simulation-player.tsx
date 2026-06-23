"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export type SimulationDecision = {
  id: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    score: number;
    feedback?: string;
    next?: string | null;
  }[];
};

export type SimulationScenario = {
  chief_complaint?: string;
  vitals?: Record<string, string | number>;
  history?: string;
  physical_exam?: string;
  steps?: { title: string; description: string }[];
  decisions?: SimulationDecision[];
  start_node?: string;
  max_score?: number;
};

const DEMO_DECISIONS: SimulationDecision[] = [
  {
    id: "triage",
    prompt: "Pacient si stěžuje na akutní bolest břicha. Jaký je váš první krok?",
    options: [
      { id: "vitals", label: "Změřit vitální funkce a ABCDE", score: 25, feedback: "Správně — stabilizace před dalším postupem.", next: "workup" },
      { id: "morphine", label: "Okamžitě podat silné analgetikum", score: 5, feedback: "Analgezie ano, ale nejdříve vitální funkce a diferenciální diagnóza.", next: "workup" },
      { id: "discharge", label: "Propustit s antacidy", score: 0, feedback: "U akutního břicha je to nebezpečné.", next: "outcome_bad" },
    ],
  },
  {
    id: "workup",
    prompt: "Vitální funkce: TK 130/85, TF 98. Co dál?",
    options: [
      { id: "labs", label: "Krevní testy + sonografie břicha", score: 35, feedback: "Vhodný další krok u akutního břicha.", next: "outcome_good" },
      { id: "xray_only", label: "Pouze RTG hrudníku", score: 10, feedback: "Nedostatečné u suspektní akutní břicho.", next: "outcome_ok" },
    ],
  },
  {
    id: "outcome_good",
    prompt: "Sonografie: suspektní apendicitida. Jak ukončíte simulaci?",
    options: [
      { id: "surgery", label: "Konzilium chirurgie, příprava na operaci", score: 40, feedback: "Výborně — správná eskalace péče.", next: null },
    ],
  },
  {
    id: "outcome_ok",
    prompt: "Výsledky nejasné. Co děláte?",
    options: [
      { id: "observe", label: "Observace + opakované vyšetření za 2 h", score: 20, feedback: "Přijatelné u stabilního pacienta.", next: null },
    ],
  },
  {
    id: "outcome_bad",
    prompt: "Pacient se vrátil s perforací. Simulace ukončena.",
    options: [
      { id: "learn", label: "Zopakovat simulaci", score: 0, feedback: "Zaměřte se na triáž a vitální funkce.", next: "triage" },
    ],
  },
];

type Props = {
  scenario: SimulationScenario;
  simulationId: string;
};

export function SimulationPlayer({ scenario, simulationId }: Props) {
  const graph = useMemo(() => {
    const decisions = scenario.decisions?.length ? scenario.decisions : DEMO_DECISIONS;
    const start = scenario.start_node ?? decisions[0]?.id ?? "triage";
    const maxScore =
      scenario.max_score ??
      decisions.reduce((sum, d) => sum + Math.max(...d.options.map((o) => o.score), 0), 0);
    return { decisions, start, maxScore, byId: Object.fromEntries(decisions.map((d) => [d.id, d])) };
  }, [scenario]);

  const [nodeId, setNodeId] = useState(graph.start);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ label: string; feedback?: string; points: number }[]>([]);
  const [finished, setFinished] = useState(false);

  const current = graph.byId[nodeId];

  function choose(option: SimulationDecision["options"][0]) {
    const nextScore = score + option.score;
    setScore(nextScore);
    setHistory((h) => [...h, { label: option.label, feedback: option.feedback, points: option.score }]);

    if (!option.next) {
      setFinished(true);
      return;
    }
    if (graph.byId[option.next]) {
      setNodeId(option.next);
    } else {
      setFinished(true);
    }
  }

  function reset() {
    setNodeId(graph.start);
    setScore(0);
    setHistory([]);
    setFinished(false);
  }

  const pct = graph.maxScore > 0 ? Math.round((score / graph.maxScore) * 100) : 0;
  const passed = pct >= 70;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interaktivní rozhodování</p>

      {!finished && current ? (
        <div className="mt-4 space-y-4">
          <p className="font-medium text-[#021d33]">{current.prompt}</p>
          <ul className="space-y-2">
            {current.options.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => choose(opt)}
                  className="w-full rounded-lg border border-slate-100 px-4 py-3 text-left text-sm transition hover:border-[#005B96] hover:bg-[#f0f7fc]"
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">Skóre: {score} / {graph.maxScore}</p>
        </div>
      ) : (
        <div className={`mt-4 rounded-lg border p-5 ${passed ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
          <p className="text-2xl font-bold text-[#021d33]">{pct}%</p>
          <p className="mt-1 text-sm text-slate-600">
            {passed ? "Výborný klinický postup!" : "Zkuste simulaci znovu s důrazem na triáž."}
          </p>
          {history.length > 0 ? (
            <ol className="mt-4 space-y-2 text-sm text-slate-700">
              {history.map((h, i) => (
                <li key={i}>
                  <span className="font-medium">{h.label}</span>
                  {h.feedback ? <span className="text-slate-500"> — {h.feedback}</span> : null}
                  <span className="text-slate-400"> (+{h.points})</span>
                </li>
              ))}
            </ol>
          ) : null}
          <Button type="button" variant="outline" className="mt-4" onClick={reset}>
            Zkusit znovu
          </Button>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-slate-400">Simulace #{simulationId.slice(0, 8)}</p>
    </section>
  );
}
