import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { listPublishedQuizzes } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyQuizzesPage() {
  const quizzes = await listPublishedQuizzes();

  return (
    <>
      <AcademyPageHeader
        eyebrow="MedScope Academy"
        title="Kvízy a testy"
        description="Ověřte si znalosti z kurzů Academy. Okamžité vyhodnocení a XP odměny."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {quizzes.length > 0 ? (
          <ul className="space-y-3">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="font-display text-lg font-semibold text-[#021d33]">{quiz.title}</h2>
                <p className="mt-1 text-sm text-slate-600">Passing score: {quiz.passing_score}%</p>
                <Link href={`/academy/quizzes/${quiz.id}`} className="mt-2 inline-block text-sm text-[#005B96] hover:underline">
                  Spustit kvíz →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Zatím nejsou publikované kvízy.
          </p>
        )}
      </div>
    </>
  );
}
