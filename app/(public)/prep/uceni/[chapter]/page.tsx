import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrepShell } from "@/components/prep/prep-shell";
import { PrepExamPlayer } from "@/components/prep/exam-player";
import { getChapter, PREP_CHAPTERS } from "@/lib/prep/curriculum";
import { generatePrepTest } from "@/lib/prep/engine";
import { buildV20PageMetadata } from "@/lib/v20/seo";

type Props = { params: Promise<{ chapter: string }> };

export function generateStaticParams() {
  return PREP_CHAPTERS.map((c) => ({ chapter: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter } = await params;
  const c = getChapter(chapter);
  return buildV20PageMetadata({
    title: c ? `${c.title} — MeDiprep` : "Kapitola — MeDiprep",
    description: c?.summary ?? "Učení na přijímačky LF",
    path: `/prep/uceni/${chapter}`,
  });
}

export default async function PrepChapterPage({ params }: Props) {
  const { chapter } = await params;
  const c = getChapter(chapter);
  if (!c) notFound();
  const test = generatePrepTest({
    mode: "learn",
    chapterId: c.id,
    subjects: [c.subject],
    count: 8,
    minutes: null,
    seed: `learn-${c.id}`,
  });

  return (
    <PrepShell active="/prep/uceni">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <header className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C45C26]">Kapitola</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{c.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-[#3d4a5c]">{c.summary}</p>
          <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-[#2F6B5A] ring-1 ring-[#e0d5c4]">
            Jak se to učit: {c.studyHint}
          </p>
        </header>
        <PrepExamPlayer test={test} immediateFeedback />
      </div>
    </PrepShell>
  );
}
