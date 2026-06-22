import Link from "next/link";
import { DollarSign, TrendingUp, CreditCard, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { V27_ENGINE_VERSION } from "@/lib/v27/version";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const admin = createServiceRoleClient();

  const [orders, subscriptions, adsRequests] = await Promise.all([
    admin.from("v27_orders").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(20),
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    admin.from("ads_requests").select("*", { count: "exact", head: true }).eq("status", "approved"),
  ]);

  const paidOrders = (orders.data ?? []).filter((o) => o.status === "paid" || o.status === "completed");
  const pendingOrders = (orders.data ?? []).filter((o) => o.status === "pending");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount_czk ?? 0), 0);

  const stats = [
    { label: "Tržby v27 (zaplaceno)", value: `${totalRevenue.toLocaleString("cs-CZ")} Kč`, icon: DollarSign },
    { label: "Aktivní předplatné", value: subscriptions.count ?? 0, icon: CreditCard },
    { label: "Čekající objednávky", value: pendingOrders.length, icon: Package },
    { label: "Schválené reklamy", value: adsRequests.count ?? 0, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">Revenue dashboard</h1>
        <p className="text-muted-foreground">
          MedScope v27 · {V27_ENGINE_VERSION} — mini-produkty, předplatné, PDF a B2B
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Poslední objednávky v27</h2>
        {(orders.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Zatím žádné objednávky. Tabulka{" "}
            <code className="rounded bg-muted px-1">v27_orders</code> se vytvoří migrací.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Produkt</th>
                  <th className="px-4 py-2 text-left">Typ</th>
                  <th className="px-4 py-2 text-right">Částka</th>
                  <th className="px-4 py-2 text-left">Stav</th>
                  <th className="px-4 py-2 text-left">Datum</th>
                </tr>
              </thead>
              <tbody>
                {(orders.data ?? []).map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-2">{o.product_id}</td>
                    <td className="px-4 py-2">{o.kind}</td>
                    <td className="px-4 py-2 text-right">{o.amount_czk} Kč</td>
                    <td className="px-4 py-2">{o.status}</td>
                    <td className="px-4 py-2">{new Date(o.created_at).toLocaleString("cs-CZ")}</td>
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
