import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function AdminAcademyLessonsPage() {
  const admin = createServiceRoleClient();
  const { data: lessons } = await admin
    .from("lessons")
    .select("id, title, slug, course_id, status, sort_order")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <>
      <p className="text-sm text-slate-600">{lessons?.length ?? 0} lekcí v databázi.</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Název</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Pořadí</th>
            </tr>
          </thead>
          <tbody>
            {(lessons ?? []).map((lesson) => (
              <tr key={lesson.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{lesson.title}</td>
                <td className="px-4 py-3 text-slate-600">{lesson.slug}</td>
                <td className="px-4 py-3">{lesson.status}</td>
                <td className="px-4 py-3">{lesson.sort_order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
