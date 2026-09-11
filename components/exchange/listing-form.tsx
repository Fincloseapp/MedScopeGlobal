"use client";

import { useMemo, useState } from "react";
import { AVAILABILITY_REGIONS, regionLabel } from "@/lib/exchange/regions";
import { categoriesForKind } from "@/lib/exchange/categories";
import { CERTIFICATION_CODES, LISTING_KINDS, type ListingKind } from "@/lib/exchange/types";
import { EXCHANGE_TARGET_LOCALES } from "@/lib/exchange/locales";
import type { ExchangeCopy } from "@/lib/i18n/exchange-copy";

export function ExchangeListingForm({ locale, copy }: { locale: string; copy: ExchangeCopy }) {
  const [kind, setKind] = useState<ListingKind>("product");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const categories = useMemo(() => categoriesForKind(kind), [kind]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const regions = AVAILABILITY_REGIONS.filter((region) => form.get(`region-${region}`) === "on");
    const certifications = CERTIFICATION_CODES.filter((code) => form.get(`cert-${code}`) === "on");
    setStatus("loading");
    try {
      const res = await fetch("/api/exchange/listings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          category: form.get("category"),
          title: form.get("title"),
          summary: form.get("summary"),
          description: form.get("description"),
          availabilityRegion: regions[0],
          availabilityRegions: regions,
          certifications,
          certificationNotApplicable: form.get("certNA") === "on",
          certificationNotes: form.get("certNotes") || undefined,
          priceHint: form.get("priceHint") || undefined,
          documentationUrl: form.get("documentationUrl") || undefined,
          sourceLocale: form.get("sourceLocale") || locale,
          isPrescriptionMedicine: false,
          containsPhi: false,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "fail");
      setMessage(copy.listingPending);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-5">
      <fieldset>
        <legend className="text-xs font-semibold text-slate-600">{copy.filterKind}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LISTING_KINDS.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <input type="radio" name="kind" checked={kind === item} onChange={() => setKind(item)} />
              {item === "product" ? copy.kindProduct : item === "service" ? copy.kindService : copy.kindDemand}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldCategory}
        <select required name="category" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.labels[locale.split("-")[0] ?? "en"] ?? item.labels.en}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldTitle}
        <input required name="title" minLength={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldSummary}
        <textarea required minLength={20} name="summary" rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldDescription}
        <textarea required minLength={40} name="description" rows={6} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
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
      <fieldset>
        <legend className="text-xs font-semibold text-slate-600">{copy.fieldCerts}</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {CERTIFICATION_CODES.map((code) => (
            <label key={code} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={`cert-${code}`} />
              {code}
            </label>
          ))}
        </div>
        {kind !== "product" ? (
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="certNA" />
            N/A
          </label>
        ) : null}
        <input name="certNotes" placeholder={copy.fieldCerts} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
      </fieldset>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldPrice}
        <input name="priceHint" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.fieldDocs}
        <input name="documentationUrl" type="url" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
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
        <input required type="checkbox" name="b2b" />
        {copy.b2bOnly}
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input required type="checkbox" name="nodrugs" />
        {copy.noDrugs}
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input required type="checkbox" name="nophi" />
        {copy.noPhi}
      </label>
      {status === "error" ? <p className="text-sm text-red-600">{copy.required}</p> : null}
      <button type="submit" disabled={status === "loading"} className="rounded-full bg-[#005B96] px-5 py-2 text-sm font-semibold text-white">
        {copy.submit}
      </button>
    </form>
  );
}
