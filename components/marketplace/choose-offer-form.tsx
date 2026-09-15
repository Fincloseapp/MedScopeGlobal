"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";

export function ChooseOfferForm({
  offerId,
  offerTitle,
  locale = "cs",
}: {
  offerId: string;
  offerTitle: string;
  locale?: string;
}) {
  const copy = getMarketplaceUiCopy(locale);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/marketplace/choose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerId,
        locale,
        company: String(form.get("company") ?? ""),
        email: String(form.get("email") ?? ""),
        message: String(form.get("message") ?? ""),
        termsAccepted: form.get("terms") === "on",
      }),
    });
    const json = (await res.json()) as { message?: string; error?: string };
    setOk(res.ok);
    setMessage(json.message ?? json.error ?? (res.ok ? copy.chooseSent : copy.chooseFailed));
    setBusy(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex text-sm font-semibold text-[#005B96] hover:underline"
      >
        {copy.chooseCta}
      </button>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-[#f7fafc] p-3">
      <p className="text-xs text-slate-600">
        {copy.chooseIntro} „{offerTitle}“
      </p>
      <input required name="company" placeholder={copy.chooseCompanyPh} className="w-full rounded-lg border px-3 py-2 text-sm" />
      <input required type="email" name="email" placeholder={copy.chooseEmailPh} className="w-full rounded-lg border px-3 py-2 text-sm" />
      <textarea required name="message" rows={3} placeholder={copy.chooseMessagePh} className="w-full rounded-lg border px-3 py-2 text-sm" />
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" name="terms" required className="mt-1" />
        <span>{copy.chooseTerms}</span>
      </label>
      <Button type="submit" size="sm" disabled={busy} className="rounded-full bg-[#005B96]">
        {busy ? copy.submitting : copy.chooseSubmit}
      </Button>
      {message ? <p className={`text-xs ${ok ? "text-emerald-800" : "text-amber-800"}`}>{message}</p> : null}
    </form>
  );
}
