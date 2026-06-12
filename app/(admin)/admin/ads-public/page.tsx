"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import type { PublicAdCampaign } from "@/lib/queries/verejnost";
import { computePublicAdStats } from "@/lib/verejnost/helpers";
import { AdEditor } from "./components/AdEditor";
import { AdStats } from "./components/AdStats";
import { AdTable } from "./components/AdTable";

export default function AdminAdsPublicPage() {
  const [campaigns, setCampaigns] = useState<PublicAdCampaign[]>([]);
  const [stats, setStats] = useState(computePublicAdStats([]));
  const [editing, setEditing] = useState<PublicAdCampaign | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await fetch("/api/admin/ads-public");
    const json = (await res.json()) as {
      ok?: boolean;
      campaigns?: PublicAdCampaign[];
      error?: string;
    };
    if (!res.ok || !json.ok) {
      setLoadError(json.error ?? "Načtení selhalo");
      return;
    }
    const list = json.campaigns ?? [];
    setCampaigns(list);
    setStats(computePublicAdStats(list));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleToggle(campaign: PublicAdCampaign) {
    setBusy(true);
    try {
      await fetch("/api/admin/ads-public", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaign.id, active: !campaign.active }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Smazat tuto kampaň?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/ads-public?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <MedScopeLogo href="/admin/ads-public" width={160} height={40} className="mb-3" />
        <h1 className="font-display text-2xl font-bold text-[#021d33]">Veřejné reklamy</h1>
        <p className="mt-1 text-sm text-slate-600">
          Správa kampaní pro sekci{" "}
          <Link href="/verejnost" className="text-[#005B96] hover:underline">
            /verejnost
          </Link>{" "}
          na medscopeglobal.com.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/verejnost" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Observabilita veřejnosti
          </Link>
          <Link href="/verejnost" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Zobrazit veřejnou sekci
          </Link>
        </div>
      </div>

      <AdStats stats={stats} />

      {loadError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{loadError}</p>
      ) : null}

      <AdEditor
        editing={editing}
        onSaved={() => {
          setEditing(null);
          void load();
        }}
        onCancel={() => setEditing(null)}
      />

      <AdTable
        campaigns={campaigns}
        busy={busy}
        onEdit={setEditing}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  );
}
