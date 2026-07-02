import Link from "next/link";

import { AdminCourseForm } from "@/components/academy/admin-course-form";
import { AdminCourseRow } from "@/components/academy/admin-course-row";
import { listAllCoursesAdmin } from "@/lib/academy/db";

export default async function AdminAcademyCoursesPage() {
  const courses = await listAllCoursesAdmin();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="text-sm text-muted-foreground">
          <span>Kurzy</span>
          <span className="ml-2 text-slate-500">({courses.length})</span>
        </nav>
        <AdminCourseForm courses={courses} />
      </div>

      {courses.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Název</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3">Úroveň</th>
                <th className="px-4 py-3">Akce</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <AdminCourseRow key={course.id} course={course} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Zatím žádné kurzy. Vytvořte první kurz pomocí formuláře výše.
        </p>
      )}
    </>
  );
}
