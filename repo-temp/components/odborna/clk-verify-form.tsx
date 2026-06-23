"use client";

import { useState } from "react";
import { submitClkVerificationForm } from "@/lib/actions/clk-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  initialStatus?: string | null;
  clkNumber?: string | null;
};

export function ClkVerifyForm({ initialStatus, clkNumber }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (initialStatus === "verified") {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Ověření ČLK je aktivní
        {clkNumber ? ` (č. ${clkNumber})` : ""}.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await submitClkVerificationForm(formData);
    setLoading(false);
    if (res.error) setError(res.error);
    else {
      setMessage(res.message ?? "Žádost odeslána.");
      if (res.status === "verified") window.location.reload();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clkNumber">Evidenční číslo ČLK</Label>
        <Input
          id="clkNumber"
          name="clkNumber"
          placeholder="např. 123456"
          defaultValue={clkNumber ?? ""}
          required
          disabled={initialStatus === "manual_review" || initialStatus === "pending"}
        />
        <p className="text-xs text-muted-foreground">
          Údaje ověřujeme proti registru České lékařské komory nebo ručně
          administrátorem.
        </p>
      </div>
      {(initialStatus === "manual_review" || initialStatus === "pending") && (
        <p className="text-sm text-amber-800">
          Vaše žádost čeká na schválení administrátorem.
        </p>
      )}
      <Button
        type="submit"
        disabled={
          loading ||
          initialStatus === "manual_review" ||
          initialStatus === "pending"
        }
      >
        {loading ? "Ověřuji…" : "Ověřit přes ČLK"}
      </Button>
      {message && (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
