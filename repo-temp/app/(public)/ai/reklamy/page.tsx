import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { AdvertisingAssistantClient } from "@/components/ai/advertising-assistant-client";

export const metadata: Metadata = {
  title: "AI Advertising Assistant",
  robots: { index: false },
};

export default async function AiReklamyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/ai/reklamy");
  }

  const gate = await requireAdmin();
  if (!gate.ok) {
    redirect("/account");
  }

  return (
    <ModulePageShell
      eyebrow="AI"
      title="Advertising Assistant"
      description="Příkazy: vložit reklamu, aktivovat klienta, generovat text/banner/nabídku (admin)."
    >
      <AdvertisingAssistantClient />
      <div className="mt-8 rounded-xl border border-dashed border-[#8dc4ea] bg-[#f8fcff] p-4 text-xs text-slate-600">
        <p className="font-semibold text-[#021d33]">Příklady příkazů</p>
        <ul className="mt-2 space-y-1">
          <li>Vlož reklamu do diagnózy RA, pozice sidebar.</li>
          <li>Vytvoř nabídku pro firmu AbbVie.</li>
          <li>Aktivuj reklamu klienta XY.</li>
        </ul>
      </div>
    </ModulePageShell>
  );
}
