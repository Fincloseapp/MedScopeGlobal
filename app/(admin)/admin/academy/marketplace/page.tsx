import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function AdminAcademyMarketplacePage() {
  const admin = createServiceRoleClient();
  const { data: listings } = await admin
    .from("marketplace_courses")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <>
      <p className="text-sm text-slate-600">Marketplace kurzů — monetizace Academy.</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Course ID</th>
              <th className="px-4 py-3">Cena CZK</th>
              <th className="px-4 py-3">Stav</th>
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{row.course_id}</td>
                <td className="px-4 py-3">{row.price_czk} Kč</td>
                <td className="px-4 py-3">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
