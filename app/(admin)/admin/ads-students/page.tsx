"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import type { StudentAdCampaign } from "@/lib/queries/marketing";
import { computeAdStats } from "@/lib/marketing/helpers";
import { StudentAdEditor } from "./components/StudentAdEditor";
import { StudentAdStats } from "./components/StudentAdStats";
import { StudentAdTable } from "./components/StudentAdTable";

export default function AdminAdsStudentsPage() {
  const [campaigns, setCampaigns] = useState<StudentAdCampaign[]>([]);
  const [stats, setStats] = useState(computeAdStats([]));
  const [editing, setEditing] = useState<StudentAdCampaign | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await fetch("/api/admin/ads-students");
    const json = (await res.json()) as {
      ok?: boolean;
      campaigns?: StudentAdCampaign[];
      error?: string;
    };
    if (!res.ok || !json.ok) {
      setLoadError(json.error ?? "Načtení selhalo");
      return;
    }
    const list = json.campaigns ?? [];
    setCampaigns(list);
    setStats(computeAdStats(list));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleToggle(campaign: StudentAdCampaign) {
    setBusy(true);
    try {
      await fetch("/api/admin/ads-students", {
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
    if (!confirm("Smazat tuto studentskou kampaň?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/ads-students?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <MedScopeLogo href="/admin/ads-students" width={160} height={40} className="mb-3" />
        <h1 className="font-display text-2xl font-bold text-[#021d33]">Studentské reklamy</h1>
        <p className="mt-1 text-sm text-slate-600">
          Správa kampaní pro{" "}
          <Link href="/articles?med_track=priprava" className="text-[#005B96] hover:underline">
            přípravu LF
          </Link>{" "}
          a{" "}
          <Link href="/articles?med_track=studium" className="text-[#005B96] hover:underline">
            studium medicíny
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/marketing-hub" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Marketing hub
          </Link>
          <Link href="/articles?med_track=studium" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Zobrazit studentské články
          </Link>
        </div>
      </div>

      <StudentAdStats stats={stats} />

      {loadError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{loadError}</p>
      ) : null}

      <StudentAdEditor
        editing={editing}
        onSaved={() => {
          setEditing(null);
          void load();
        }}
        onCancel={() => setEditing(null)}
      />

      <StudentAdTable
        campaigns={campaigns}
        busy={busy}
        onEdit={setEditing}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  );
}
