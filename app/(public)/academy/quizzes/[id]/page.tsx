import { notFound } from "next/navigation";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { getQuizById } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AcademyQuizDetailPage({ params }: Props) {
  const { id } = await params;
  const quiz = await getQuizById(id, false);
  if (!quiz) notFound();

  return (
    <>
      <AcademyPageHeader eyebrow="Kvíz" title={quiz.title} description={`Minimální skóre: ${quiz.passing_score}%`} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ol className="space-y-6">
          {quiz.questions.map((q, i) => (
            <li key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-500">Otázka {i + 1}</p>
              <p className="mt-2 font-display text-lg text-[#021d33]">{q.question_text}</p>
              {Array.isArray(q.options) && q.options.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {(q.options as { label?: string; value?: unknown }[]).map((opt, j) => (
                    <li key={j} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                      {opt.label ?? String(opt.value ?? opt)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-xs text-slate-500">
          Interaktivní odeslání odpovědí přes POST /api/academy/quizzes/{id} — UI ve fázi 3.
        </p>
      </div>
    </>
  );
}
