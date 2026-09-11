"use client";

import { useState } from "react";
import type { ExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function ExchangeContactForm({
  listingSlug,
  locale,
  copy,
}: {
  listingSlug: string;
  locale: string;
  copy: ExchangeCopy;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("loading");
    try {
      const res = await fetch("/api/exchange/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingSlug,
          buyerOrganization: form.get("buyerOrganization"),
          buyerName: form.get("buyerName"),
          buyerEmail: form.get("buyerEmail"),
          buyerPhone: form.get("buyerPhone") || undefined,
          message: form.get("message"),
          locale,
          acceptTerms: form.get("acceptTerms") === "on",
          acceptNoPhi: form.get("acceptNoPhi") === "on",
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
        {copy.contactSuccess}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-[#cfe1f3] bg-white p-5">
      <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.contactTitle}</h2>
      <p className="text-sm text-slate-600">{copy.contactLead}</p>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldCompany}
        <input required name="buyerOrganization" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldName}
        <input required name="buyerName" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldEmail}
        <input required type="email" name="buyerEmail" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldPhone}
        <input name="buyerPhone" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldMessage}
        <textarea required minLength={20} name="message" rows={5} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input required type="checkbox" name="acceptTerms" className="mt-0.5" />
        {copy.acceptTerms}{" "}
        <a className="text-[#005B96] underline" href={localizePublicHref("/exchange/legal/terms", locale)}>
          {copy.termsTitle}
        </a>
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input required type="checkbox" name="acceptNoPhi" className="mt-0.5" />
        {copy.noPhi}
      </label>
      {status === "error" ? <p className="text-sm text-red-600">{copy.required}</p> : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-[#005B96] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {copy.submit}
      </button>
    </form>
  );
}
