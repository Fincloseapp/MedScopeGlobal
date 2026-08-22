"use client";

import { useEffect, useState } from "react";
import { Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INTEGRATION_PRESETS } from "@/lib/mediktor/presets";

type IntegrationType = "export" | "webhook" | "hl7" | "fhir" | "api";

type IntegrationState = {
  active: boolean;
  integrationType: IntegrationType;
  presetTarget: string;
  webhookUrl: string;
};

const EMPTY: IntegrationState = {
  active: false,
  integrationType: "export",
  presetTarget: "generic",
  webhookUrl: "",
};

export function IntegrationSettings() {
  const [state, setState] = useState<IntegrationState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/mediktor/integration", { credentials: "same-origin" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          integration?: {
            active?: boolean;
            integrationType?: IntegrationType;
            presetTarget?: string | null;
            webhookUrl?: string | null;
          } | null;
        };
        const i = json.integration;
        if (i) {
          setState({
            active: Boolean(i.active),
            integrationType: i.integrationType || "export",
            presetTarget: i.presetTarget || "generic",
            webhookUrl: i.webhookUrl || "",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(active: boolean) {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/mediktor/integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          skip: !active,
          active,
          integrationType: state.integrationType,
          presetTarget: state.presetTarget,
          webhookUrl: state.webhookUrl || null,
          formats:
            state.integrationType === "hl7"
              ? ["hl7", "text"]
              : state.integrationType === "fhir"
                ? ["fhir", "text"]
                : ["text", "pdf", "docx"],
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMsg(body.error || "Uložení selhalo.");
        return;
      }
      setState((s) => ({ ...s, active }));
      setMsg(active ? "Propojení je zapnuté." : "Propojení je vypnuté — používáte kopírování.");
    } catch {
      setMsg("Síťová chyba.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="inline-flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Načítám propojení…
      </p>
    );
  }

  const needsUrl = state.integrationType === "webhook" || state.integrationType === "api";

  return (
    <div className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#021d33]">
        <Link2 className="h-4 w-4 text-[#005B96]" />
        Napojení na váš software
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Volitelné. Bez nastavení stačí tlačítko Kopírovat. Stav:{" "}
        <span className="font-medium text-[#021d33]">
          {state.active ? "odesílání zapnuto" : "jen ruční kopírování"}
        </span>
      </p>
      <div className="mt-3 space-y-2">
        <label className="block text-xs font-medium text-slate-600">
          Typ
          <select
            className="mt-1 h-11 w-full rounded-xl border border-[#d9e8f4] bg-white px-3 text-sm"
            value={state.integrationType}
            onChange={(e) =>
              setState((s) => ({ ...s, integrationType: e.target.value as IntegrationType }))
            }
          >
            <option value="export">Jen export (kopírovat / .doc)</option>
            <option value="webhook">Webhook / API (automaticky po uložení)</option>
            <option value="hl7">HL7</option>
            <option value="fhir">FHIR R4</option>
            <option value="api">API klíč</option>
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Cílový systém
          <select
            className="mt-1 h-11 w-full rounded-xl border border-[#d9e8f4] bg-white px-3 text-sm"
            value={state.presetTarget}
            onChange={(e) => setState((s) => ({ ...s, presetTarget: e.target.value }))}
          >
            {INTEGRATION_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        {needsUrl ? (
          <Input
            className="h-11 rounded-xl"
            placeholder="https://vas-system.cz/webhook"
            value={state.webhookUrl}
            onChange={(e) => setState((s) => ({ ...s, webhookUrl: e.target.value }))}
          />
        ) : null}
      </div>
      {msg ? <p className="mt-2 text-xs text-[#005B96]">{msg}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="h-9 rounded-full bg-[#22a05a] hover:bg-[#1b874b]"
          disabled={saving || (needsUrl && !state.webhookUrl.trim())}
          onClick={() => void save(true)}
        >
          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          Zapnout odesílání
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 rounded-full"
          disabled={saving}
          onClick={() => void save(false)}
        >
          Vypnout (jen kopírovat)
        </Button>
      </div>
    </div>
  );
}
