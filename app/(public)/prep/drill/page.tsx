import type { Metadata } from "next";
import { PrepShell } from "@/components/prep/prep-shell";
import { PrepExamPlayer } from "@/components/prep/exam-player";
import { TestLaunchForm } from "@/components/prep/test-launch-form";
import { generatePrepTest } from "@/lib/prep/engine";
import { listPrepTopics } from "@/lib/prep/questions";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildV20PageMetadata({
  title: "Drill témat — MeDiprep",
  description: "Rychlé opakování jednoho tématu z biologie, chemie nebo fyziky. Cílený trénink slabých míst k přijímačkám LF.",
  path: "/prep/drill",
});

type Props = {
  searchParams: Promise<{ topic?: string; subject?: string; seed?: string }>;
};

export default async function PrepDrillPage({ searchParams }: Props) {
  const params = await searchParams;
  const topic = params.topic;
  const subject =
    params.subject === "biologie" || params.subject === "chemie" || params.subject === "fyzika"
      ? (params.subject as PrepSubject)
      : undefined;

  if (!topic) {
    const topics = listPrepTopics(subject);
    return (
      <PrepShell active="/prep/drill">
        <div className="mx-auto max-w-xl space-y-6 px-4 py-10 sm:px-6">
          <h1 className="font-display text-3xl font-semibold">Drill</h1>
          <p className="text-sm text-[#5a5348]">
            Deset otázek z jednoho tématu. Bez odpočtu — jde o přesnost, ne o simulaci.
          </p>
          <ul className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <li key={t}>
                <a
                  href={`/prep/drill?topic=${encodeURIComponent(t)}`}
                  className="inline-block rounded-full bg-white px-3 py-1 text-sm ring-1 ring-[#e0d5c4] hover:border-[#C45C26]"
                >
                  {t}
                </a>
              </li>
            ))}
          </ul>
          <TestLaunchForm />
        </div>
      </PrepShell>
    );
  }

  const test = generatePrepTest({
    mode: "drill",
    topic,
    subjects: subject ? [subject] : undefined,
    count: 10,
    minutes: null,
    seed: params.seed ?? `${Date.now()}-drill`,
  });

  return (
    <PrepShell active="/prep/drill">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <PrepExamPlayer key={test.id} test={test} immediateFeedback />
      </div>
    </PrepShell>
  );
}
