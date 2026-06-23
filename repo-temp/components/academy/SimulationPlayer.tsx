"use client";

import { useMemo, useState } from "react";
import { Award, CheckCircle2, RotateCcw, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SimulationChoice = {
  id: string;
  label: string;
  next?: string;
  score?: number;
  feedback?: string;
  terminal?: boolean;
};

export type SimulationNode = {
  id: string;
  prompt: string;
  context?: string;
  choices: SimulationChoice[];
};

export type SimulationScenario = {
  introduction?: string;
  nodes: Record<string, SimulationNode>;
  start_id?: string;
  max_score?: number;
};

type Props = {
  title: string;
  difficulty: string;
  scenario: SimulationScenario;
};

export function SimulationPlayer({ title, difficulty, scenario }: Props) {
  const startId = scenario.start_id ?? "start";
  const [nodeId, setNodeId] = useState(startId);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const node = scenario.nodes[nodeId];
  const maxScore = scenario.max_score ?? 100;
  const pct = Math.min(100, Math.round((score / maxScore) * 100));

  const badge = useMemo(() => {
    if (!completed) return null;
    if (pct >= 80) return { label: "Výborně", tone: "text-green-700 bg-green-50 border-green-200" };
    if (pct >= 60) return { label: "Dobře", tone: "text-[#005B96] bg-[#e8f4fc] border-[#cfe1f3]" };
    return { label: "K procvičení", tone: "text-amber-800 bg-amber-50 border-amber-200" };
  }, [completed, pct]);

  function choose(choice: SimulationChoice) {
    if (completed) return;
    setFeedback(choice.feedback ?? null);
    setScore((s) => s + (choice.score ?? 0));
    setHistory((h) => [...h, nodeId]);

    const next = choice.next;
    const isTerminal = choice.terminal || !next || !scenario.nodes[next];

    if (isTerminal) {
      setCompleted(true);
      return;
    }

    setNodeId(next);
  }

  function restart() {
    setNodeId(startId);
    setScore(0);
    setFeedback(null);
    setHistory([]);
    setCompleted(false);
  }

  if (!node) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Scénář simulace nemá platný počáteční uzel.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Stethoscope className="h-4 w-4 text-[#005B96]" />
          <span>Obtížnost: {difficulty}</span>
        </div>
        <div className="text-sm font-medium text-[#021d33]">
          Skóre: {score} / {maxScore} ({pct}%)
        </div>
      </div>

      {scenario.introduction ? (
        <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {scenario.introduction}
        </p>
      ) : null}

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {node.context ? (
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">{node.context}</p>
        ) : null}
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{title}</h2>
        <p className="mt-4 text-slate-700">{node.prompt}</p>

        {!completed ? (
          <ul className="mt-6 space-y-2">
            {node.choices.map((choice) => (
              <li key={choice.id}>
                <button
                  type="button"
                  onClick={() => choose(choice)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm transition hover:border-[#005B96]/40 hover:bg-[#f0f7fc]"
                >
                  {choice.label}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-[#cfe1f3] bg-[#f8fbff] p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-[#005B96]" />
            <p className="font-display text-lg font-semibold text-[#021d33]">Simulace dokončena</p>
            {badge ? (
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${badge.tone}`}>
                <Award className="h-4 w-4" />
                {badge.label} · {pct}%
              </span>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={restart}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Zkusit znovu
            </Button>
          </div>
        )}
      </article>

      {feedback ? (
        <div className="rounded-xl border border-[#cfe1f3] bg-[#f0f7fc] px-4 py-3 text-sm text-[#021d33]">
          <p className="font-medium">Zpětná vazba</p>
          <p className="mt-1 text-slate-700">{feedback}</p>
        </div>
      ) : null}

      {history.length > 0 && !completed ? (
        <p className="text-xs text-slate-400">Krok {history.length + 1}</p>
      ) : null}
    </div>
  );
}
