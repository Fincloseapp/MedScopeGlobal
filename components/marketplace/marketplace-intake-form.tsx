"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getTurnstileSiteKeyClient, useCaptchaToken } from "@/components/security/use-captcha";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";

type Kind = "offer" | "demand";

export function MarketplaceIntakeForm({
  defaultKind = "offer",
  locale = "cs",
}: {
  defaultKind?: Kind;
  locale?: string;
}) {
  const copy = getMarketplaceUiCopy(locale);
  const [kind, setKind] = useState<Kind>(defaultKind);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const siteKey = getTurnstileSiteKeyClient();
  const { token: captchaToken, widget, required: captchaRequired } = useCaptchaToken(siteKey);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (captchaRequired && !captchaToken) {
      setOk(false);
      setMessage(copy.captcha);
      setBusy(false);
      return;
    }
    const form = new FormData(e.currentTarget);
    const payload = {
      kind,
      locale,
      company: String(form.get("company") ?? ""),
      title: String(form.get("title") ?? ""),
      summary: String(form.get("summary") ?? ""),
      contactEmail: String(form.get("contactEmail") ?? ""),
      termsAccepted: form.get("terms") === "on",
      captchaToken: captchaToken || undefined,
    };
    try {
      const res = await fetch("/api/marketplace/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { message?: string; error?: string };
      setOk(res.ok);
      setMessage(json.message ?? json.error ?? (res.ok ? copy.sent : copy.failed));
      if (res.ok) e.currentTarget.reset();
    } catch {
      setOk(false);
      setMessage(copy.network);
    }
    setBusy(false);
  }

  return (
    <div id="formular" className="rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">{copy.formKicker}</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">{copy.formTitle}</h2>
      <p className="mt-2 text-sm text-slate-600">{copy.formLead}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            { id: "offer" as const, label: copy.kindOffer },
            { id: "demand" as const, label: copy.kindDemand },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setKind(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              kind === item.id ? "bg-[#005B96] text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-4 grid gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#021d33]">{copy.company}</span>
          <input required name="company" placeholder={copy.companyPh} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#021d33]">{copy.workEmail}</span>
          <input required type="email" name="contactEmail" placeholder={copy.emailPh} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#021d33]">
            {kind === "demand" ? copy.demandTitle : copy.offerTitle}
          </span>
          <input required name="title" className="w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#021d33]">{copy.summary}</span>
          <textarea required name="summary" rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" name="terms" required className="mt-1" />
          <span>{copy.gdpr}</span>
        </label>
        <div className="space-y-3">
          {widget}
          <Button type="submit" disabled={busy || (captchaRequired && !captchaToken)} className="rounded-full bg-[#005B96]">
            {busy ? copy.submitting : kind === "demand" ? copy.submitDemand : copy.submitOffer}
          </Button>
        </div>
        {message ? <p className={`text-sm ${ok ? "text-emerald-800" : "text-amber-800"}`}>{message}</p> : null}
      </form>
    </div>
  );
}
