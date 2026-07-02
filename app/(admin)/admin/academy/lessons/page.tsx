import { AdminLessonForm } from "@/components/academy/admin-lesson-form";
import { AdminLessonRow } from "@/components/academy/admin-lesson-row";
import { listAllCoursesAdmin } from "@/lib/academy/db";
import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function AdminAcademyLessonsPage() {
  const [courses, lessons] = await Promise.all([
    listAllCoursesAdmin(),
    (async () => {
      const admin = createServiceRoleClient();
      const { data } = await admin
        .from("lessons")
        .select("id, title, slug, course_id, status, sort_order")
        .order("updated_at", { ascending: false })
        .limit(100);
      return data ?? [];
    })(),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{lessons.length} lekcí v databázi.</p>
        <AdminLessonForm courses={courses} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Název</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Pořadí</th>
              <th className="px-4 py-3">Akce</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <AdminLessonRow key={lesson.id} lesson={lesson} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
