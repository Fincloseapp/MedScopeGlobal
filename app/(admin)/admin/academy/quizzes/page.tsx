import { AdminQuizForm } from "@/components/academy/admin-quiz-form";
import { AdminQuizRow } from "@/components/academy/admin-quiz-row";
import { listAllCoursesAdmin } from "@/lib/academy/db";
import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function AdminAcademyQuizzesPage() {
  const [courses, quizzes] = await Promise.all([
    listAllCoursesAdmin(),
    (async () => {
      const admin = createServiceRoleClient();
      const { data } = await admin
        .from("quizzes")
        .select("id, title, course_id, lesson_id, status, passing_score")
        .order("updated_at", { ascending: false })
        .limit(100);
      return data ?? [];
    })(),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{quizzes.length} kvízů v databázi.</p>
        <AdminQuizForm courses={courses} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Název</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Pass %</th>
              <th className="px-4 py-3">Náhled</th>
              <th className="px-4 py-3">Akce</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <AdminQuizRow key={quiz.id} quiz={quiz} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
