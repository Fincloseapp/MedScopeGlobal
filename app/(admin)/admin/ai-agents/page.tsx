import Link from "next/link";
import { Bot, Trophy, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAiAgentGrowthSnapshot } from "@/lib/growth/ai-agent-stats";
import { AI_AGENT_GOAL_NEAR, AI_AGENT_GOAL_SEP27 } from "@/lib/growth/ai-agent-program";

export const dynamic = "force-dynamic";

function formatInt(value: number): string {
  return value.toLocaleString("cs-CZ");
}

function formatCzk(value: number): string {
  return `${value.toLocaleString("cs-CZ")} Kč`;
}

function pct(part: number, whole: number): string {
  if (whole <= 0) return "0 %";
  return `${Math.min(999, Math.round((part / whole) * 1000) / 10)} %`;
}

export default async function AdminAiAgentsPage() {
  const snap = await loadAiAgentGrowthSnapshot();
  const live = snap.subscribers.totalLive;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">AI agenti — růst a žebříček</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Cíle programu jsou ambiciózní. Čísla níže jsou jen reálná předplatná a objednávky z databáze —
          žádný vymyšlený dosah. Zdroj: {snap.dataSource}. Aktualizováno {new Date(snap.loadedAt).toLocaleString("cs-CZ")}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Živá předplatná</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInt(live)}</p>
            <p className="text-xs text-muted-foreground">
              active {formatInt(snap.subscribers.active)} · trial {formatInt(snap.subscribers.trialing)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cíl 10. 9. 2026</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pct(live, AI_AGENT_GOAL_NEAR.count)}</p>
            <p className="text-xs text-muted-foreground">
              {formatInt(live)} / {formatInt(AI_AGENT_GOAL_NEAR.count)} · {snap.goals.near.label}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cíl 27. 9. 2026</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pct(live, AI_AGENT_GOAL_SEP27.count)}</p>
            <p className="text-xs text-muted-foreground">
              {formatInt(live)} / {formatInt(AI_AGENT_GOAL_SEP27.count)} · {snap.goals.sep27.label}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zaplacené objednávky v27</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInt(snap.revenue.v27PaidOrders)}</p>
            <p className="text-xs text-muted-foreground">{formatCzk(snap.revenue.v27PaidCzk)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className={snap.visibility.visible ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40"}>
        <CardHeader>
          <CardTitle className="text-base">Viditelnost nárůstu předplatitelů</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium text-[#021d33]">{snap.visibility.label}</p>
          <p className={snap.goals.near.onTrack ? "text-emerald-800" : "text-amber-800"}>
            Cíl 10. 9.: {snap.goals.near.onTrack ? "na cestě" : "mimo tempo"} — {snap.goals.near.label}
          </p>
          <p className={snap.goals.sep27.onTrack ? "text-emerald-800" : "text-amber-800"}>
            Cíl 27. 9.: {snap.goals.sep27.onTrack ? "na cestě" : "mimo tempo"} — {snap.goals.sep27.label}
          </p>
          <p className="text-muted-foreground">
            Poslední 3 dny: {formatInt(snap.visibility.last3)} nových · předchozí 3 dny: {formatInt(snap.visibility.prev3)}.
            Tempo 7 dní: {formatInt(snap.pace.last7)} ({snap.pace.dailyAvg7} / den). Newsletter:{" "}
            {formatInt(snap.subscribers.newsletter)} · VIP: {formatInt(snap.subscribers.vip)}.
          </p>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Žebříček AI agentů</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Skóre = zaplacené objednávky s <code>ai_ref</code> × 100 + checkout × 10 + newsletter × 5 +
          návštěvy s <code>?ref=</code>. Bez atribuce se agent nepočítá.
        </p>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Agent</th>
                <th className="px-4 py-2 text-right">Návštěvy</th>
                <th className="px-4 py-2 text-right">Checkout</th>
                <th className="px-4 py-2 text-right">Newsletter</th>
                <th className="px-4 py-2 text-right">Zaplaceno</th>
              </tr>
            </thead>
            <tbody>
              {snap.leaderboard.map((row, index) => (
                <tr key={row.agent} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium">{row.agent}</td>
                  <td className="px-4 py-2 text-right">{formatInt(row.visits)}</td>
                  <td className="px-4 py-2 text-right">{formatInt(row.checkouts)}</td>
                  <td className="px-4 py-2 text-right">{formatInt(row.newsletters)}</td>
                  <td className="px-4 py-2 text-right">{formatInt(row.paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Nová předplatná po dnech</h2>
        {snap.daily.length === 0 ? (
          <p className="text-sm text-muted-foreground">Za posledních 30 dní zatím žádný nový řádek v subscriptions.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Den</th>
                  <th className="px-4 py-2 text-right">Nová předplatná</th>
                </tr>
              </thead>
              <tbody>
                {[...snap.daily].reverse().map((row) => (
                  <tr key={row.date} className="border-t">
                    <td className="px-4 py-2">{row.date}</td>
                    <td className="px-4 py-2 text-right">{formatInt(row.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
          <Bot className="h-5 w-5" />
          Legální kanály spolupráce
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {snap.channels.map((channel) => (
            <li key={channel.id} className="rounded-lg border bg-white px-3 py-2 text-sm">
              {channel.label}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/pro-ai" className="font-medium text-[#005B96] hover:underline">
            Veřejná stránka /pro-ai
          </Link>
          {" · "}
          <Link href="/llms.txt" className="font-medium text-[#005B96] hover:underline">
            llms.txt
          </Link>
          {" · "}
          <Link href="/.well-known/ai.txt" className="font-medium text-[#005B96] hover:underline">
            well-known/ai.txt
          </Link>
          {" · "}
          <Link href="/admin/revenue" className="font-medium text-[#005B96] hover:underline">
            Tržby a výplaty — pending vs. peníze na účet
          </Link>
        </p>
      </section>
    </div>
  );
}
