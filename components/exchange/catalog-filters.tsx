"use client";

import { useRouter } from "next/navigation";
import { AVAILABILITY_REGIONS, regionLabel, type AvailabilityRegion } from "@/lib/exchange/regions";
import { categoriesForKind } from "@/lib/exchange/categories";
import type { ListingKind } from "@/lib/exchange/types";
import type { ExchangeCopy } from "@/lib/i18n/exchange-copy";

export function ExchangeCatalogFilters({
  locale,
  copy,
  q,
  kind,
  category,
  regions,
  path,
}: {
  locale: string;
  copy: ExchangeCopy;
  q: string;
  kind: string;
  category: string;
  regions: AvailabilityRegion[];
  path: string;
}) {
  const router = useRouter();

  function apply(next: Record<string, string | string[]>) {
    const params = new URLSearchParams();
    const merged = { q, kind, category, regions: regions.join(","), ...next };
    if (merged.q) params.set("q", String(merged.q));
    if (merged.kind && merged.kind !== "any") params.set("kind", String(merged.kind));
    if (merged.category) params.set("category", String(merged.category));
    const regionValue = Array.isArray(merged.regions) ? merged.regions.join(",") : String(merged.regions ?? "");
    if (regionValue) params.set("regions", regionValue);
    const qs = params.toString();
    router.push(qs ? `${path}?${qs}` : path);
  }

  const kinds: { id: string; label: string }[] = [
    { id: "any", label: copy.allKinds },
    { id: "product", label: copy.kindProduct },
    { id: "service", label: copy.kindService },
    { id: "demand", label: copy.kindDemand },
  ];

  return (
    <form
      className="grid gap-3 rounded-2xl border border-[#cfe1f3] bg-white p-4 md:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        apply({
          q: String(form.get("q") ?? ""),
          kind: String(form.get("kind") ?? "any"),
          category: String(form.get("category") ?? ""),
        });
      }}
    >
      <label className="block text-xs font-semibold text-slate-600">
        {copy.filterSearch}
        <input
          name="q"
          defaultValue={q}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.filterKind}
        <select
          name="kind"
          defaultValue={kind || "any"}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {kinds.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        {copy.filterCategory}
        <select
          name="category"
          defaultValue={category}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">{copy.allKinds}</option>
          {categoriesForKind((kind as ListingKind) || "any").map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.labels[locale.split("-")[0] ?? "en"] ?? item.labels.en}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button type="submit" className="w-full rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white">
          {copy.filterSearch}
        </button>
      </div>
      <fieldset className="md:col-span-4">
        <legend className="text-xs font-semibold text-slate-600">{copy.filterRegion}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVAILABILITY_REGIONS.map((region) => {
            const active = regions.includes(region);
            const next = active ? regions.filter((item) => item !== region) : [...regions, region];
            return (
              <button
                key={region}
                type="button"
                onClick={() => apply({ regions: next.join(",") })}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  active ? "border-[#005B96] bg-[#005B96] text-white" : "border-[#cfe1f3] text-slate-700"
                }`}
              >
                {regionLabel(region, locale)}
              </button>
            );
          })}
        </div>
      </fieldset>
    </form>
  );
}
