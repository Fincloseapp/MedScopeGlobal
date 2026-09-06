"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  getKarieraHubCopy,
  JOB_FILTER_VALUES,
} from "@/lib/i18n/kariera-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function JobFilters({ locale = "cs" }: { locale?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const copy = getKarieraHubCopy(locale);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    router.push(localizePublicHref(query ? `/kariera?${query}` : "/kariera", locale));
  }

  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-[#cfe1f3] bg-white p-4">
      <FilterSelect
        label={copy.filters.specialty}
        allLabel={copy.filters.all}
        value={params.get("specialization") ?? ""}
        options={JOB_FILTER_VALUES.specialties}
        optionLabels={copy.filters.specialties}
        onChange={(v) => update("specialization", v)}
      />
      <FilterSelect
        label={copy.filters.region}
        allLabel={copy.filters.all}
        value={params.get("region") ?? ""}
        options={JOB_FILTER_VALUES.regions}
        optionLabels={copy.filters.regions}
        onChange={(v) => update("region", v)}
      />
      <FilterSelect
        label={copy.filters.contract}
        allLabel={copy.filters.all}
        value={params.get("employment_type") ?? ""}
        options={JOB_FILTER_VALUES.contracts}
        optionLabels={copy.filters.contracts}
        onChange={(v) => update("employment_type", v)}
      />
    </div>
  );
}

function FilterSelect({
  label,
  allLabel,
  value,
  options,
  optionLabels,
  onChange,
}: {
  label: string;
  allLabel: string;
  value: string;
  options: readonly string[];
  optionLabels: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-xs">
      <span className="font-semibold text-slate-600">{label}</span>
      <select
        className="mt-1 block rounded-md border border-input px-2 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {optionLabels[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}
