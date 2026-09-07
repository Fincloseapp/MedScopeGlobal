import Link from "next/link";
import { Swords } from "lucide-react";
import { ArenaBattle } from "@/components/admin/arena-battle";
import { loadArenaDashboard } from "@/lib/growth/arena/dashboard";
import { AI_AGENT_GOAL_NEAR } from "@/lib/growth/ai-agent-program";

export const dynamic = "force-dynamic";

export default async function AdminAiTeamsPage() {
  let dash;
  try {
    dash = await loadArenaDashboard();
  } catch (err) {
    const message = err instanceof Error ? err.message : "arena dashboard failed";
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-medical-navy">Růstová aréna</h1>
        <p className="text-sm text-amber-800">
          Vyhodnocení se teď nenačetlo ({message}). Obnovte stránku — cron běží dál.
        </p>
      </div>
    );
  }
  const live = dash.liveSubscribers;

  return (
    <div className="space-y-8">
      <div>
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
          <Swords className="h-3.5 w-3.5" />
          Multi-agent arena
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-medical-navy">
          Růstová aréna — předplatné a inzerce
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{dash.honesty}</p>
        <p className="mt-2 text-sm">
          Platící {dash.payingSubscribers.toLocaleString("cs-CZ")} · živá vč. trial{" "}
          {live.toLocaleString("cs-CZ")} / {AI_AGENT_GOAL_NEAR.count.toLocaleString("cs-CZ")} do 10. 9. ·{" "}
          {dash.goals.nearPace.onTrack ? "na cestě" : "mimo tempo"} — {dash.goals.nearPace.label}
        </p>
        <p className="mt-2 text-sm">
          Úspěch jen zaplacené předplatné. Návštěvy a košík nejsou výhra.
          Závod: kdo má víc Stripe active / ai_agent_paid. 0–0 = remíza.
          {" · "}
          <Link href="/admin/ai-agents" className="font-medium text-[#005B96] hover:underline">
            Externí AI agenti
          </Link>
          {" · "}
          <Link href="/admin/revenue" className="font-medium text-[#005B96] hover:underline">
            Tržby
          </Link>
          {" · "}
          <Link href="/admin/ads-requests" className="font-medium text-[#005B96] hover:underline">
            Žádosti o reklamu
          </Link>
        </p>
      </div>
      <ArenaBattle initial={dash} />
    </div>
  );
}
