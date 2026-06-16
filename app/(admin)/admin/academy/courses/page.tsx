import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { listAllCoursesAdmin } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "Koncept",
  published: "Publikováno",
  archived: "Archiv",
};

export default async function AdminAcademyCoursesPage() {
  let courses: Awaited<ReturnType<typeof listAllCoursesAdmin>> = [];
  let error: string | null = null;

  try {
    courses = await listAllCoursesAdmin();
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="space-y-6">
      <MedScopeLogo href="/admin/academy" preset="admin-sidebar" />
      <div>
        <Link href="/admin/academy" className="text-sm text-[#005B96] hover:underline">
          ← Academy dashboard
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">Kurzy Academy</h1>
        <p className="text-sm text-slate-600">Všechny kurzy včetně konceptů (service role).</p>
      </div>

      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </p>
      ) : courses.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Žádné kurzy. Přidejte přes POST /api/academy/courses nebo migraci seed.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Název</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3">Veřejný</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-slate-600">{c.slug}</td>
                  <td className="px-4 py-3">{STATUS_LABELS[c.status] ?? c.status}</td>
                  <td className="px-4 py-3">{c.is_public ? "Ano" : "Ne"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
