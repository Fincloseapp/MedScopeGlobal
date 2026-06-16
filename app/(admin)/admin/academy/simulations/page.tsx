import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function AdminAcademySimulationsPage() {
  const admin = createServiceRoleClient();
  const { data: rows } = await admin
    .from("clinical_simulations")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <>
      <p className="text-sm text-slate-600">Klinické simulace pro AI training.</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Název</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Obtížnost</th>
              <th className="px-4 py-3">Stav</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{row.title}</td>
                <td className="px-4 py-3">{row.slug}</td>
                <td className="px-4 py-3">{row.difficulty}</td>
                <td className="px-4 py-3">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
