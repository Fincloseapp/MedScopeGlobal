"use client";

import { useState } from "react";
import { submitClkVerificationForm } from "@/lib/actions/clk-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOdbornaHubCopy } from "@/lib/i18n/odborna-hub-copy";

type Props = {
  initialStatus?: string | null;
  clkNumber?: string | null;
  locale?: string;
};

export function ClkVerifyForm({ initialStatus, clkNumber, locale = "cs" }: Props) {
  const pack = getOdbornaHubCopy(locale);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (initialStatus === "verified") {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        {pack.clkActive}
        {clkNumber ? ` (${clkNumber})` : ""}.
      </p>
    );
  }

  function localizeError(raw: string): string {
    if (raw === "Přihlaste se pro ověření ČLK.") return pack.clkNeedLogin;
    if (raw === "Zadejte evidenční číslo ČLK.") return pack.clkNeedNumber;
    if (raw === "Ověření se nezdařilo.") return pack.clkFailed;
    return raw;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await submitClkVerificationForm(formData);
    setLoading(false);
    if (res.error) setError(localizeError(res.error));
    else {
      setMessage(res.message ?? pack.clkSent);
      if (res.status === "verified") window.location.reload();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clkNumber">{pack.clkNumberLabel}</Label>
        <Input
          id="clkNumber"
          name="clkNumber"
          placeholder="123456"
          defaultValue={clkNumber ?? ""}
          required
          disabled={initialStatus === "manual_review" || initialStatus === "pending"}
        />
        <p className="text-xs text-muted-foreground">{pack.clkNumberHint}</p>
      </div>
      {(initialStatus === "manual_review" || initialStatus === "pending") && (
        <p className="text-sm text-amber-800">{pack.clkPending}</p>
      )}
      <Button
        type="submit"
        disabled={
          loading ||
          initialStatus === "manual_review" ||
          initialStatus === "pending"
        }
      >
        {loading ? pack.clkSubmitting : pack.clkSubmit}
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
