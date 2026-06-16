import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function AdminAcademyQuizzesPage() {
  const admin = createServiceRoleClient();
  const { data: quizzes } = await admin
    .from("quizzes")
    .select("id, title, course_id, lesson_id, status, passing_score")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <>
      <p className="text-sm text-slate-600">{quizzes?.length ?? 0} kvízů v databázi.</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Název</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Pass %</th>
            </tr>
          </thead>
          <tbody>
            {(quizzes ?? []).map((quiz) => (
              <tr key={quiz.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{quiz.title}</td>
                <td className="px-4 py-3">{quiz.status}</td>
                <td className="px-4 py-3">{quiz.passing_score}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
