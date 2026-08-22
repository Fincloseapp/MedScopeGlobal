"use client";

import Link from "next/link";
import { buildWeeklyPlan } from "@/lib/prep/weekly-plan";
import { PREP_CHAPTERS } from "@/lib/prep/curriculum";
import { getPrepFaculty } from "@/lib/prep/faculties";
import { FacultyPicker } from "@/components/prep/faculty-picker";
import { usePrepProgress } from "@/components/prep/progress-store";
import { useMeDiprepEntitlement } from "@/components/prep/use-mediprep-entitlement";
import { MeDiprepPaywall } from "@/components/prep/mediprep-paywall";
import { subjectLabel } from "@/lib/prijimacky/faculties-admissions";

export function PrepDashboard() {
  const { progress, ready } = usePrepProgress();
  const { entitled } = useMeDiprepEntitlement();
  const faculty = progress.facultySlug ? getPrepFaculty(progress.facultySlug) : undefined;
  const plan = buildWeeklyPlan(progress, progress.facultySlug);
  const last = progress.attempts.slice(0, 8);
  const weak = Object.values(progress.topicStats)
    .filter((t) => t.seen >= 2)
    .sort((a, b) => a.correct / a.seen - b.correct / b.seen)
    .slice(0, 5);
  const avg =
    last.length > 0 ? Math.round(last.reduce((s, a) => s + a.scorePct, 0) / last.length) : null;
  const chaptersDone = progress.completedChapters.length;

  if (!ready) {
    return <p className="px-4 py-16 text-sm text-[#6b6256]">Načítám progres…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C45C26]">Váš týden</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Plán a skóre</h1>
          <p className="mt-2 max-w-xl text-sm text-[#5a5348]">
            {faculty
              ? `Trénujete na ${faculty.shortName}. Úlohy se skládají z originální banky v rytmu této fakulty.`
              : "Vyberte fakultu — simulace se přizpůsobí blokům a bodování."}
          </p>
        </div>
        <FacultyPicker current={progress.facultySlug} />
      </header>

      {!entitled && progress.attempts.length > 0 ? <MeDiprepPaywall reason="drill" compact /> : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Poslední průměr" value={avg !== null ? `${avg} %` : "—"} hint="z posledních testů" />
        <Stat label="Kapitoly" value={`${chaptersDone}/${PREP_CHAPTERS.length}`} hint="splněný mini test" />
        <Stat label="Pokusy" value={String(progress.attempts.length)} hint="uložené v tomto prohlížeči" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-[#e0d5c4] bg-white p-6">
          <h2 className="font-display text-xl font-semibold">Doporučení na tento týden</h2>
          <ol className="mt-4 space-y-3">
            {plan.map((task) => (
              <li key={task.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#F8F4EA] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#C45C26]">{task.day}</p>
                  <p className="font-medium text-[#1A2332]">{task.title}</p>
                  <p className="mt-1 text-xs text-[#6b6256]">{task.why}</p>
                </div>
                <Link href={task.href} className="shrink-0 rounded-full bg-[#1A2332] px-3 py-1.5 text-xs font-medium text-white">
                  {task.minutes} min
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#e0d5c4] bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Nejslabší témata</h2>
            {weak.length === 0 ? (
              <p className="mt-3 text-sm text-[#6b6256]">Po dvou a více odpovědích v tématu se tady objeví mezery.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {weak.map((t) => (
                  <li key={t.topic} className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      {t.topic}
                      <span className="ml-2 text-xs text-[#6b6256]">{subjectLabel(t.subject)}</span>
                    </span>
                    <Link
                      href={`/app/priprava?tab=testy&mode=drill&topic=${encodeURIComponent(t.topic)}&subject=${t.subject}`}
                      className="text-[#C45C26] hover:underline"
                    >
                      {Math.round((t.correct / t.seen) * 100)} %
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-[24px] border border-[#e0d5c4] bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Skóre v čase</h2>
            {last.length === 0 ? (
              <p className="mt-3 text-sm text-[#6b6256]">Zatím žádný odevzdaný test.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {last.map((a) => (
                  <li key={a.id} className="flex justify-between gap-3">
                    <span className="truncate text-[#5a5348]">{a.title}</span>
                    <span className="font-medium">{a.scorePct} %</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-[#e0d5c4] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b6256]">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-[#8a8174]">{hint}</p>
    </div>
  );
}
