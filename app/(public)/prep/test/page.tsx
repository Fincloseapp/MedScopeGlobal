import type { Metadata } from "next";
import { PrepShell } from "@/components/prep/prep-shell";
import { PrepExamPlayer } from "@/components/prep/exam-player";
import { TestLaunchForm } from "@/components/prep/test-launch-form";
import { generatePrepTest } from "@/lib/prep/engine";
import type { PrepMode } from "@/lib/prep/types";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildV20PageMetadata({
  title: "Testy nanečisto — MeDiprep",
  description: "Časované mini testy a simulace přijímaček LF z biologie, chemie a fyziky. Originální otázky s vysvětlením.",
  path: "/prep/test",
});

type Props = {
  searchParams: Promise<{
    mode?: string;
    subject?: string;
    faculty?: string;
    count?: string;
    topic?: string;
    seed?: string;
  }>;
};

function parseSubjects(raw?: string): PrepSubject[] | undefined {
  if (!raw || raw === "mixed" || raw === "all") return ["biologie", "chemie", "fyzika"];
  if (raw === "biologie" || raw === "chemie" || raw === "fyzika") return [raw];
  return undefined;
}

export default async function PrepTestPage({ searchParams }: Props) {
  const params = await searchParams;
  const mode = (params.mode as PrepMode | undefined) ?? undefined;
  const seed = params.seed ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (!mode) {
    return (
      <PrepShell active="/prep/test">
        <div className="mx-auto max-w-xl space-y-6 px-4 py-10 sm:px-6">
          <h1 className="font-display text-3xl font-semibold">Testy</h1>
          <p className="text-sm text-[#5a5348]">
            Mini test na tempo, simulace podle fakulty, nebo drill jednoho tématu. První spuštění je zdarma, bez karty.
          </p>
          <TestLaunchForm />
        </div>
      </PrepShell>
    );
  }

  const test = generatePrepTest({
    mode: mode === "simulation" || mode === "drill" || mode === "mini" || mode === "rapid" ? mode : "mini",
    subjects: parseSubjects(params.subject),
    facultySlug: params.faculty || null,
    count: Math.min(40, Math.max(5, Number(params.count ?? 15) || 15)),
    topic: params.topic,
    seed,
  });

  return (
    <PrepShell active="/prep/test">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <PrepExamPlayer key={test.id} test={test} />
      </div>
    </PrepShell>
  );
}
