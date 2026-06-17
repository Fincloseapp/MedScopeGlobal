import { createServiceRoleClient } from "@/lib/supabase/service";
import { AdminVideoForm } from "@/components/academy/admin-video-form";

export default async function AdminAcademyVideoPage() {
  const admin = createServiceRoleClient();
  const { data: videos } = await admin
    .from("video_assets")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Video assets — upload do Supabase Storage (<code className="text-xs">media/academy/videos</code>).
        </p>
        <AdminVideoForm />
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Název</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Storage</th>
              <th className="px-4 py-3">Délka</th>
            </tr>
          </thead>
          <tbody>
            {(videos ?? []).map((row) => {
              const meta = (row.metadata ?? {}) as { public_url?: string };
              return (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {meta.public_url ? (
                      <a href={meta.public_url} className="text-[#005B96] hover:underline" target="_blank" rel="noreferrer">
                        {row.storage_path ?? "soubor"}
                      </a>
                    ) : (
                      row.storage_path ?? "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{row.duration_seconds ?? 0}s</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
