"use client";

import { useMemo, useState } from "react";
import { generatePrepTest } from "@/lib/prep/engine";
import type { PrepMode } from "@/lib/prep/types";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";
import { PrepExamPlayer } from "@/components/prep/exam-player";
import { TestLaunchForm } from "@/components/prep/test-launch-form";
import { usePrepProgress } from "@/components/prep/progress-store";
import { useMeDiprepEntitlement } from "@/components/prep/use-mediprep-entitlement";
import { MeDiprepPaywall } from "@/components/prep/mediprep-paywall";
import { canStartPrepMode } from "@/lib/prep/entitlement";

function parseSubjects(raw?: string): PrepSubject[] | undefined {
  if (!raw || raw === "mixed" || raw === "all") return ["biologie", "chemie", "fyzika"];
  if (raw === "biologie" || raw === "chemie" || raw === "fyzika") return [raw];
  return undefined;
}

export function MeDiprepTestTab({
  initial,
}: {
  initial?: { mode?: string; subject?: string; faculty?: string; count?: string; topic?: string };
}) {
  const { progress } = usePrepProgress();
  const { entitled } = useMeDiprepEntitlement();
  const [query, setQuery] = useState(initial ?? {});

  const requestedMode = (query.mode as PrepMode | undefined) ?? undefined;
  const gate =
    requestedMode && requestedMode !== "pexeso"
      ? canStartPrepMode(requestedMode, progress.attempts, entitled)
      : { ok: true as const };

  const test = useMemo(() => {
    const mode = query.mode as PrepMode | undefined;
    if (!mode) return null;
    if (mode === "simulation" || mode === "drill" || mode === "mini" || mode === "rapid" || mode === "learn") {
      const allowed = canStartPrepMode(mode, progress.attempts, entitled);
      if (!allowed.ok) return null;
    }
    return generatePrepTest({
      mode: mode === "simulation" || mode === "drill" || mode === "mini" || mode === "rapid" ? mode : "mini",
      subjects: parseSubjects(query.subject),
      facultySlug: query.faculty || progress.facultySlug,
      count: Math.min(40, Math.max(5, Number(query.count ?? 15) || 15)),
      topic: query.topic,
      seed: `${Date.now()}-${mode}`,
      seenIds: progress.seenQuestionIds,
    });
  }, [query, progress.facultySlug, progress.seenQuestionIds, progress.attempts, entitled]);

  if (requestedMode && !gate.ok) {
    return <MeDiprepPaywall reason={gate.reason} />;
  }

  if (!test) {
    return (
      <div className="px-4 py-6">
        <TestLaunchForm actionPath="/app/priprava" extraParams={{ tab: "testy" }} />
        <p className="mt-3 text-center text-xs text-[#8a8174]">
          Formulář otevře test v aplikaci. Můžete taky zvolit simulaci níže.
        </p>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-4">
      <button type="button" className="mb-3 text-sm text-[#C45C26]" onClick={() => setQuery({})}>
        ← Zpět na sestavení
      </button>
      <PrepExamPlayer key={test.id} test={test} immediateFeedback={test.mode === "drill" || test.mode === "learn"} />
    </div>
  );
}
