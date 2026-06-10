"use client";

import { useState } from "react";
import { listV24Quizzes } from "@/lib/v24/quizzes-data";
import { Button } from "@/components/ui/button";

export function QuizBuilderPanel() {
  const quizzes = listV24Quizzes();
  const [status, setStatus] = useState<string | null>(null);

  async function seed() {
    setStatus("Ukládám…");
    const res = await fetch("/api/v24/quizzes/seed", { method: "POST" });
    const data = await res.json();
    setStatus(res.ok ? `Uloženo ${data.count} kvízů` : data.error ?? "Chyba");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button onClick={seed}>Seed kvízů na D: + DB</Button>
      </div>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
      <ul className="space-y-3">
        {quizzes.map((q) => (
          <li key={q.slug} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-[#021d33]">{q.title}</p>
            <p className="text-xs text-slate-500">
              {q.type} · {q.questions.length} otázek · /kvizy/{q.slug}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
