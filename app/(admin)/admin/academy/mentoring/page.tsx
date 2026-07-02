import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function AdminAcademyMentoringPage() {
  const admin = createServiceRoleClient();
  const { data: sessions } = await admin
    .from("mentoring_sessions")
    .select("*")
    .order("scheduled_at", { ascending: false })
    .limit(50);

  return (
    <>
      <p className="text-sm text-slate-600">Mentoring sessions — AI + lidský mentoring.</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Termín</th>
              <th className="px-4 py-3">Poznámky</th>
            </tr>
          </thead>
          <tbody>
            {(sessions ?? []).map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">
                  {row.scheduled_at ? new Date(row.scheduled_at).toLocaleString("cs-CZ") : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{row.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
