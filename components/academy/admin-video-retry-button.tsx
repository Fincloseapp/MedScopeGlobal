"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type Props = {
  videoAssetId: string;
  canRetry: boolean;
  renderStatus?: string;
};

export function AdminVideoRetryButton({ videoAssetId, canRetry, renderStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!canRetry) return null;

  async function retry() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/academy/video/retry", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_asset_id: videoAssetId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        result?: { render_provider?: string; status?: string; message?: string };
      };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? data.result?.message ?? `Chyba (${res.status})`);
        return;
      }
      setStatus(
        `Znovu zařazeno (${data.result?.render_provider ?? "?"}: ${data.result?.status ?? "?"})`
      );
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" size="sm" variant="outline" onClick={retry} disabled={loading}>
        <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Opakuji…" : "Opakovat render"}
      </Button>
      {renderStatus === "processing" ? (
        <span className="text-xs text-amber-600">Render probíhá…</span>
      ) : null}
      {status ? <span className="text-xs text-slate-600">{status}</span> : null}
    </div>
  );
}
