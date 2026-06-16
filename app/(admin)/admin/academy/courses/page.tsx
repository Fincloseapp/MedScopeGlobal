import Link from "next/link";
import { listAllCoursesAdmin } from "@/lib/academy/db";

const STATUS_LABELS: Record<string, string> = {
  draft: "Koncept",
  published: "Publikováno",
  archived: "Archiv",
};

export default async function AdminAcademyCoursesPage() {
  const courses = await listAllCoursesAdmin();

  return (
    <>
      <nav className="text-sm text-muted-foreground">
        <span>Kurzy</span>
        <span className="ml-2 text-slate-500">({courses.length})</span>
      </nav>

      {courses.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Název</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3">Úroveň</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-[#021d33]">{course.title}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <Link href={`/academy/courses/${course.slug}`} className="hover:underline">
                      {course.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{STATUS_LABELS[course.status] ?? course.status}</td>
                  <td className="px-4 py-3 text-slate-600">{course.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Zatím žádné kurzy. Vytvořte kurz přes POST /api/academy/courses.
        </p>
      )}
    </>
  );
}
