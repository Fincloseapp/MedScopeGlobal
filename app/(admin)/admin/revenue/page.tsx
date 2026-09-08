import Link from "next/link";
import {
  Banknote,
  Clock,
  CreditCard,
  Package,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatStripeMinor } from "@/lib/admin/stripe-snapshot";
import { loadRevenueDashboard } from "@/lib/admin/revenue-dashboard";
import {
  STRIPE_AVAILABLE_EXPLAIN,
  STRIPE_PENDING_EXPLAIN,
  V27_GROSS_EXPLAIN,
  explainV27OrderStatus,
} from "@/lib/monetization/order-statuses";
import { AI_AGENT_GOAL_NEAR, AI_AGENT_GOAL_SEP27 } from "@/lib/growth/ai-agent-program";
import { V27_ENGINE_VERSION } from "@/lib/v27/version";

export const dynamic = "force-dynamic";

function formatInt(value: number): string {
  return value.toLocaleString("cs-CZ");
}

function formatCzk(value: number): string {
  return `${value.toLocaleString("cs-CZ")} Kč`;
}

function moneyList(
  rows: { amount: number; currency: string }[],
  empty: string
): string {
  if (rows.length === 0) return empty;
  return rows.map((row) => formatStripeMinor(row.amount, row.currency)).join(" · ");
}

export default async function AdminRevenuePage() {
  const dash = await loadRevenueDashboard(null);
  const live = dash.growth.subscribers.totalLive;
  const stripe = dash.stripe;
  const statusLegend = ["pending", "paid", "completed", "expired", "canceled", "refunded"] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">Tržby a výplaty</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          MedScope v27 · {V27_ENGINE_VERSION}. Čísla jsou z databáze a Stripe — žádný vymyšlený dosah.
          Ceníkové Kč ≠ peníze na účtu.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/admin/vydelky" className="font-medium text-[#005B96] hover:underline">
            Kam uvidíte peníze (Stripe, Heureka, Amazon, inzerce)
          </Link>
          {" · "}
          <Link href="/admin/ai-agents" className="font-medium text-[#005B96] hover:underline">
            Růst předplatných
          </Link>
        </p>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4" />
            Kolik peněz dostanete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p className="text-3xl font-bold text-[#021d33]">
            {moneyList(dash.youWillReceive, stripe.configured ? "0" : "Stripe není v tomto prostředí")}
          </p>
          <p>
            Součet <strong>available + pending + výplata na cestě</strong> po poplatku Stripe. To je
            částka, která má dorazit na firemní účet (ne ceník v27).
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-700">
            <li>
              <strong>K výplatě teď:</strong> {moneyList(stripe.available, "0")} — {STRIPE_AVAILABLE_EXPLAIN}
            </li>
            <li>
              <strong>Stripe pending:</strong> {moneyList(stripe.pending, "0")} — {STRIPE_PENDING_EXPLAIN}
            </li>
            <li>
              <strong>Plán výplat:</strong>{" "}
              {stripe.payoutSchedule ?? "nezjištěn"}
              {stripe.payoutsEnabled === false ? " · výplaty vypnuté, doplňte banku ve Stripe" : ""}
              {stripe.payoutsEnabled === true ? " · výplaty zapnuté" : ""}
            </li>
          </ul>
          {stripe.error ? <p className="text-amber-800">{stripe.error}</p> : null}
          <p className="text-xs text-slate-500">{V27_GROSS_EXPLAIN}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zaplaceno v27 (ceník)</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCzk(dash.counts.paidCzk)}</p>
            <p className="text-xs text-muted-foreground">{formatInt(dash.counts.paid)} objednávek</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Čekající checkout</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInt(dash.counts.pending)}</p>
            <p className="text-xs text-muted-foreground">
              {formatCzk(dash.counts.pendingCzk)} ceník · na účet 0 Kč, dokud karta neprojde
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Živá předplatná</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInt(live)}</p>
            <p className="text-xs text-muted-foreground">
              active {formatInt(dash.growth.subscribers.active)} · trial{" "}
              {formatInt(dash.growth.subscribers.trialing)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Schválené reklamy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInt(dash.adsApproved)}</p>
            <p className="text-xs text-muted-foreground">B2B inzerce — faktura, ne Stripe zůstatek</p>
          </CardContent>
        </Card>
      </div>

      <Card className={dash.growth.visibility.visible ? "border-emerald-200" : "border-amber-200 bg-amber-50/40"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4" />
            Cíle 10. 9. a 27. 9. — skutečná čísla
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            {formatInt(live)} / {formatInt(AI_AGENT_GOAL_NEAR.count)} do 10. 9. ·{" "}
            {dash.growth.goals.near.onTrack ? "na cestě" : "mimo tempo"} — {dash.growth.goals.near.label}
          </p>
          <p>
            {formatInt(live)} / {formatInt(AI_AGENT_GOAL_SEP27.count)} do 27. 9. ·{" "}
            {dash.growth.goals.sep27.onTrack ? "na cestě" : "mimo tempo"} — {dash.growth.goals.sep27.label}
          </p>
          <p className="text-muted-foreground">{dash.growth.visibility.label}</p>
          <p>
            Kód <strong>nevytváří</strong> 170 000 platících lidí. Když tempo nestačí, autonomně běží
            jen legální kanály: IndexNow (cron /api/cron/growth-sprint), sitemap, reconcilace
            zaplacených checkoutů, výplata available zůstatku, recovery e-mail Stripe, newsletter,
            AI hop /pro-ai.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automatické akce</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Tato stránka jen čte čísla. Sprint (IndexNow, reconcilace, výplata) běží na cronu
            {" "}
            <code className="text-xs">/api/cron/growth-sprint</code>
            , ne při každém otevření CMS.
          </p>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Co znamená pending</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left">Stav</th>
                <th className="px-4 py-2 text-left">Peníze</th>
                <th className="px-4 py-2 text-left">Význam</th>
              </tr>
            </thead>
            <tbody>
              {statusLegend.map((status) => {
                const row = explainV27OrderStatus(status);
                return (
                  <tr key={status} className="border-t">
                    <td className="px-4 py-2 font-medium">
                      {row.label} <code className="text-xs">{status}</code>
                    </td>
                    <td className="px-4 py-2">
                      {row.money === "in_stripe"
                        ? "ve Stripe"
                        : row.money === "returned"
                          ? "vráceno"
                          : "0 Kč"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{row.detail}</td>
                  </tr>
                );
              })}
              <tr className="border-t bg-amber-50/60">
                <td className="px-4 py-2 font-medium">
                  Stripe pending <code className="text-xs">balance.pending</code>
                </td>
                <td className="px-4 py-2">ano, čeká ve Stripe</td>
                <td className="px-4 py-2 text-muted-foreground">{STRIPE_PENDING_EXPLAIN}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {stripe.recentPayouts.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold">Výplaty Stripe</h2>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-right">Částka</th>
                  <th className="px-4 py-2 text-left">Stav</th>
                  <th className="px-4 py-2 text-left">Příchod na účet</th>
                </tr>
              </thead>
              <tbody>
                {stripe.recentPayouts.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-xs">{row.id}</td>
                    <td className="px-4 py-2 text-right">
                      {formatStripeMinor(row.amount, row.currency)}
                    </td>
                    <td className="px-4 py-2">{row.status}</td>
                    <td className="px-4 py-2">
                      {row.arrivalDate
                        ? new Date(row.arrivalDate).toLocaleDateString("cs-CZ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Poslední objednávky v27</h2>
        {dash.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Zatím žádné objednávky, nebo chybí tabulka <code>v27_orders</code>.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Produkt</th>
                  <th className="px-4 py-2 text-left">Typ</th>
                  <th className="px-4 py-2 text-right">Ceník</th>
                  <th className="px-4 py-2 text-left">Stav</th>
                  <th className="px-4 py-2 text-left">Peníze</th>
                  <th className="px-4 py-2 text-left">Datum</th>
                </tr>
              </thead>
              <tbody>
                {dash.recent.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-2">{row.productId}</td>
                    <td className="px-4 py-2">{row.kind}</td>
                    <td className="px-4 py-2 text-right">{formatCzk(row.amountCzk)}</td>
                    <td className="px-4 py-2">
                      {row.explain.label}{" "}
                      <code className="text-[11px] text-muted-foreground">{row.status}</code>
                    </td>
                    <td className="px-4 py-2">
                      {row.explain.money === "in_stripe"
                        ? "ve Stripe"
                        : row.explain.money === "returned"
                          ? "vráceno"
                          : "0 Kč"}
                    </td>
                    <td className="px-4 py-2">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString("cs-CZ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link href="/admin/v27-pipeline" className="text-sm text-[#005B96] hover:underline">
        → Content pipeline v27
      </Link>
    </div>
  );
}
