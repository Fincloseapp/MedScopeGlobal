import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { AdminSimulationEditor } from "@/components/academy/admin-simulation-editor";

export default async function AdminAcademySimulationsPage() {
  const admin = tryCreateServiceRoleClient();
  const { data: rows } = admin
    ? await admin
        .from("clinical_simulations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <>
      <p className="text-sm text-slate-600">
        Klinické simulace — editor <code className="text-xs">scenario_json.decisions</code> pro větvení.
      </p>
      <div className="mt-4 space-y-4">
        {(rows ?? []).map((row) => (
          <div key={row.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-[#021d33]">{row.title}</p>
                <p className="text-xs text-slate-500">
                  {row.slug} · {row.difficulty} · {row.status}
                </p>
              </div>
              <AdminSimulationEditor simulation={row} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
