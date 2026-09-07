import Link from "next/link";
import { Swords } from "lucide-react";
import { ArenaBattle } from "@/components/admin/arena-battle";
import { loadArenaDashboard } from "@/lib/growth/arena/dashboard";
import { AI_AGENT_GOAL_NEAR } from "@/lib/growth/ai-agent-program";

export const dynamic = "force-dynamic";

export default async function AdminAiTeamsPage() {
  const dash = await loadArenaDashboard();
  const live = dash.liveSubscribers;

  return (
    <div className="space-y-8">
      <div>
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
          <Swords className="h-3.5 w-3.5" />
          Multi-agent arena
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-medical-navy">
          Souboj týmů Alfa vs Beta
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{dash.honesty}</p>
        <p className="mt-2 text-sm">
          Živá předplatná {live.toLocaleString("cs-CZ")} / {AI_AGENT_GOAL_NEAR.count.toLocaleString("cs-CZ")} do
          10. 9. · {dash.goals.nearPace.onTrack ? "na cestě" : "mimo tempo"} — {dash.goals.nearPace.label}
        </p>
        <p className="mt-2 text-sm">
          Priorita sekcí:{" "}
          {dash.sections.map((row) => `${row.priority}. ${row.label}`).join(" → ")}
          {" · "}
          <Link href="/admin/ai-agents" className="font-medium text-[#005B96] hover:underline">
            Externí AI agenti
          </Link>
        </p>
      </div>
      <ArenaBattle initial={dash} />
    </div>
  );
}
