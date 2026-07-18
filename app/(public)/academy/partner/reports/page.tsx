import { redirect } from "next/navigation";
import { PartnerReportDashboard } from "@/components/academy/b2b/partner-report-dashboard";
import { listPartnerMemberships } from "@/lib/academy/b2b/db";
import { createClient } from "@/lib/supabase/server";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner reporty — MedScope Academy",
};

export default async function PartnerReportsPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login?next=/academy/partner/reports");

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?next=/academy/partner/reports");

  const admin = tryCreateServiceRoleClient();
  let partners = (await listPartnerMemberships(auth.user.id)).map((m) => m.partner);

  // Platform admins can export for any active partner
  if (admin) {
    const { data: userRow } = await admin
      .from("users")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (userRow?.role === "admin") {
      const { data } = await admin
        .from("partner_institutions")
        .select("*")
        .eq("is_active", true)
        .order("name");
      partners = (data ?? []) as typeof partners;
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f9fc_0%,#ffffff_50%)]">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <header className="mb-8 max-w-xl">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            MedScope Academy · Partner
          </p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight text-[#021d33]">
            Reporty pro ČLK
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Export dokončených CME kurzů pro hromadný upload do portálu ČLK.
          </p>
        </header>
        <PartnerReportDashboard partners={partners} />
      </div>
    </main>
  );
}
