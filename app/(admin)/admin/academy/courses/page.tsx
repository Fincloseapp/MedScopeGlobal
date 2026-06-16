import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { listAllCoursesAdmin } from "@/lib/academy/db";

const STATUS_LABELS: Record<string, string> = {
  draft: "Koncept",
  published: "Publikováno",
  archived: "Archiv",
};

export default async function AdminAcademyCoursesPage() {
  const courses = await listAllCoursesAdmin();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <MedScopeLogo href="/admin" preset="admin-sidebar" />
      <nav className="mt-4 text-sm text-muted-foreground">
        <Link href="/admin/academy" className="hover:text-foreground">
          Academy
        </Link>
        <span className="mx-2">/</span>
        <span>Kurzy</span>
      </nav>
      <h1 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">Kurzy Academy</h1>
      <p className="mt-2 text-sm text-slate-600">
        {courses.length} kurzů celkem. Editor kurzů ve fázi 2.
      </p>

      {courses.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
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
                  <td className="px-4 py-3 text-slate-600">{course.slug}</td>
                  <td className="px-4 py-3">{STATUS_LABELS[course.status] ?? course.status}</td>
                  <td className="px-4 py-3 text-slate-600">{course.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Zatím žádné kurzy. Vytvořte kurz přes API POST /api/academy/courses nebo ve fázi 2 v editoru.
        </p>
      )}
    </div>
  );
}
