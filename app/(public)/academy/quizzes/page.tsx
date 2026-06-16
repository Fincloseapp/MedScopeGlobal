import { AcademyPageHeader } from "@/components/academy/page-header";
import { listPublishedQuizzes } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyQuizzesPage() {
  const quizzes = await listPublishedQuizzes(30);

  return (
    <>
      <AcademyPageHeader
        eyebrow="Testování znalostí"
        title="Kvízy"
        description="Ověřte si znalosti z kurzů MedScope Academy."
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {quizzes.length > 0 ? (
          <ul className="space-y-3">
            {quizzes.map((q) => (
              <li key={q.id} className="rounded-xl border border-[#cfe1f3] bg-white px-5 py-4">
                <h2 className="font-semibold text-[#021d33]">{q.title}</h2>
                <p className="mt-1 text-sm text-slate-500">Passing score: {q.passing_score}%</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-slate-500">Zatím nejsou publikované kvízy.</p>
        )}
      </div>
    </>
  );
}
