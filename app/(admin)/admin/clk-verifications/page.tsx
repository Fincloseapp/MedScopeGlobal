import type { Metadata } from "next";
import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { adminReviewClkForm } from "@/lib/actions/clk-verification";
import { readClkStore } from "@/lib/auth/clk-data-store";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ČLK ověření — Admin",
};

export const dynamic = "force-dynamic";

type ClkRow = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  clk_number: string;
  status: string;
  method: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Čeká",
  manual_review: "Ruční kontrola",
  verified: "Ověřeno",
  rejected: "Zamítnuto",
};

async function loadRows(): Promise<{ source: string; rows: ClkRow[] }> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("clk_verifications")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (!error && data) {
    return { source: "supabase", rows: data as ClkRow[] };
  }

  const fileStore = readClkStore();
  return {
    source: "file",
    rows: fileStore.verifications.map((r) => ({
      id: r.id,
      user_id: r.userId,
      email: r.email,
      full_name: r.fullName,
      clk_number: r.clkNumber,
      status: r.status,
      method: r.method,
      verified_at: r.verifiedAt,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    })),
  };
}

export default async function AdminClkVerificationsPage() {
  const { source, rows } = await loadRows();
  const pending = rows.filter((r) =>
    ["pending", "manual_review"].includes(r.status)
  );
  const resolved = rows.filter(
    (r) => !["pending", "manual_review"].includes(r.status)
  );

  return (
    <div className="space-y-8">
      <div>
        <MedScopeLogo href="/admin/clk-verifications" width={160} height={40} className="mb-3" />
        <h1 className="font-display text-2xl font-bold text-[#021d33]">
          ČLK ověření lékařů
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Ruční schválení žádostí o ověření evidenčního čísla ČLK pro přístup do odborné sekce.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Zdroj dat: {source} · celkem {rows.length} záznamů
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Admin
          </Link>
          <Link href="/admin/tests" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Testy
          </Link>
          <Link href="/admin/ads-overview" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Ads overview
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Fronta ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Žádné žádosti ve frontě (pending / manual_review).
          </p>
        ) : (
          <ul className="space-y-4">
            {pending.map((row) => (
              <li key={row.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{row.full_name ?? row.email ?? row.user_id}</CardTitle>
                    <CardDescription>
                      ČLK {row.clk_number} · {STATUS_LABEL[row.status] ?? row.status} ·{" "}
                      {row.method === "api" ? "API" : "ruční"} ·{" "}
                      {new Date(row.updated_at).toLocaleString("cs-CZ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-3">
                    {row.email ? (
                      <span className="text-sm text-muted-foreground">{row.email}</span>
                    ) : null}
                    <form action={adminReviewClkForm}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="decision" value="verified" />
                      <Button type="submit" size="sm">
                        Schválit
                      </Button>
                    </form>
                    <form action={adminReviewClkForm}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="decision" value="rejected" />
                      <Button type="submit" size="sm" variant="outline">
                        Zamítnout
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {resolved.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Vyřízené ({resolved.length})
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Jméno / e-mail</th>
                  <th className="px-3 py-2 font-medium">ČLK</th>
                  <th className="px-3 py-2 font-medium">Stav</th>
                  <th className="px-3 py-2 font-medium">Metoda</th>
                  <th className="px-3 py-2 font-medium">Aktualizováno</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2">
                      {row.full_name ?? row.email ?? row.user_id}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{row.clk_number}</td>
                    <td className="px-3 py-2">
                      {STATUS_LABEL[row.status] ?? row.status}
                    </td>
                    <td className="px-3 py-2">{row.method}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(row.updated_at).toLocaleString("cs-CZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
