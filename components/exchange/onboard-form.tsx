"use client";

import { useState } from "react";
import { AVAILABILITY_REGIONS, regionLabel } from "@/lib/exchange/regions";
import { ORG_KINDS } from "@/lib/exchange/types";
import { EXCHANGE_TARGET_LOCALES } from "@/lib/exchange/locales";
import type { ExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function ExchangeOnboardForm({ locale, copy }: { locale: string; copy: ExchangeCopy }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const availabilityRegions = AVAILABILITY_REGIONS.filter((region) => form.get(`region-${region}`) === "on");
    setStatus("loading");
    try {
      const res = await fetch("/api/exchange/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: form.get("legalName"),
          tradeName: form.get("tradeName") || undefined,
          kind: form.get("kind"),
          registrationId: form.get("registrationId"),
          vatId: form.get("vatId") || undefined,
          countryCode: form.get("countryCode"),
          website: form.get("website") || undefined,
          contactEmail: form.get("contactEmail"),
          contactPhone: form.get("contactPhone") || undefined,
          contactPerson: form.get("contactPerson"),
          availabilityRegions,
          sourceLocale: form.get("sourceLocale") || locale,
          description: form.get("description"),
          acceptTerms: form.get("acceptTerms") === "on",
          acceptPrivacy: form.get("acceptPrivacy") === "on",
          acceptB2bOnly: form.get("acceptB2bOnly") === "on",
          acceptNoPublicDrugs: form.get("acceptNoPublicDrugs") === "on",
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
    return <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm">{copy.onboardSuccess}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-[#cfe1f3] bg-white p-5">
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-slate-600">
        {copy.howSteps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}.</strong> {step.body}
          </li>
        ))}
      </ol>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldCompany}
        <input required name="legalName" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.companyProfile}
        <input name="tradeName" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.filterKind}
        <select name="kind" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
          {ORG_KINDS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldIco}
        <input required name="registrationId" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        VAT / DIČ
        <input name="vatId" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        ISO country
        <input required name="countryCode" defaultValue="CZ" maxLength={2} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm uppercase" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldName}
        <input required name="contactPerson" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldEmail}
        <input required type="email" name="contactEmail" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldPhone}
        <input name="contactPhone" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldDescription}
        <textarea required minLength={20} name="description" rows={4} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <fieldset>
        <legend className="text-xs font-semibold text-slate-600">
          {copy.fieldRegion} ({copy.required})
        </legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {AVAILABILITY_REGIONS.map((region) => (
            <label key={region} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={`region-${region}`} />
              {regionLabel(region, locale)}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldLocale}
        <select name="sourceLocale" defaultValue={locale.split("-")[0]} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
          {EXCHANGE_TARGET_LOCALES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input required type="checkbox" name="acceptTerms" />
        {copy.acceptTerms}{" "}
        <a className="text-[#005B96] underline" href={localizePublicHref("/exchange/legal/terms", locale)}>
          {copy.termsTitle}
        </a>
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input required type="checkbox" name="acceptPrivacy" />
        {copy.acceptPrivacy}{" "}
        <a className="text-[#005B96] underline" href={localizePublicHref("/exchange/legal/privacy", locale)}>
          {copy.privacyTitle}
        </a>
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input required type="checkbox" name="acceptB2bOnly" />
        {copy.b2bOnly}
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input required type="checkbox" name="acceptNoPublicDrugs" />
        {copy.noDrugs}
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input required type="checkbox" name="acceptNoPhi" />
        {copy.noPhi}
      </label>
      {status === "error" ? <p className="text-sm text-red-600">{copy.required}</p> : null}
      <button type="submit" disabled={status === "loading"} className="rounded-full bg-[#005B96] px-5 py-2 text-sm font-semibold text-white">
        {copy.submit}
      </button>
    </form>
  );
}
