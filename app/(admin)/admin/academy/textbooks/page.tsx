import { createServiceRoleClient } from "@/lib/supabase/service";
import { AdminTextbookForm } from "@/components/academy/admin-textbook-form";
import { AdminTextbookEditor } from "@/components/academy/admin-textbook-editor";

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
        <p className="text-sm text-slate-600">
          Digitální učebnice — WYSIWYG editor kapitol s publikací.
        </p>
        <AdminTextbookForm />
      </div>
      <div className="mt-4 space-y-4">
        {(rows ?? []).map((row) => {
          const meta = (row.metadata ?? {}) as { chapters?: unknown[] };
          const chapterCount = Array.isArray(meta.chapters) ? meta.chapters.length : 0;
          return (
            <div key={row.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-[#021d33]">{row.title}</p>
                  <p className="text-xs text-slate-500">
                    {row.slug} · {row.status} · {chapterCount || 0} kapitol
                  </p>
                </div>
                <AdminTextbookEditor textbook={row} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
