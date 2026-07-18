import { redirect } from "next/navigation";
import { PartnerReportDashboard } from "@/components/academy/b2b/partner-report-dashboard";
import { listPartnerMemberships } from "@/lib/academy/b2b/db";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner reporty — MedScope Academy",
};

export default async function PartnerReportsPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/prihlaseni?next=/academy/partner/reports");

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/prihlaseni?next=/academy/partner/reports");

  const admin = createServiceRoleClient();
  const { data: userRow } = await admin
    .from("users")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  let partners = (await listPartnerMemberships(auth.user.id)).map((m) => m.partner);

  // Platform admins can export for any active partner
  if (userRow?.role === "admin") {
    const { data } = await admin
      .from("partner_institutions")
      .select("*")
      .eq("is_active", true)
      .order("name");
    partners = (data ?? []) as typeof partners;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f9fc_0%,#ffffff_50%)]">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <PartnerReportDashboard partners={partners} />
      </div>
    </main>
  );
}
