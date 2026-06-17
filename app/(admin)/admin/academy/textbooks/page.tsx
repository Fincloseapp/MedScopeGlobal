import { createServiceRoleClient } from "@/lib/supabase/service";
import { AdminTextbookForm } from "@/components/academy/admin-textbook-form";

export default async function AdminAcademyTextbooksPage() {
  const admin = createServiceRoleClient();
  const { data: rows } = await admin
    .from("textbooks")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Digitální učebnice Academy — kapitoly v metadata.</p>
        <AdminTextbookForm />
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Název</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Kapitoly</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => {
              const meta = (row.metadata ?? {}) as { chapters?: unknown[] };
              const chapterCount = Array.isArray(meta.chapters) ? meta.chapters.length : 0;
              return (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3">{row.slug}</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">{chapterCount || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
