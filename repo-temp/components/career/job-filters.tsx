"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SPECIALIZATIONS = ["interní", "chirurgie", "pediatrie", "výzkum", "sestra"];
const REGIONS = ["Praha", "Brno", "Ostrava", "ČR", "SK"];
const TYPES = ["HPP", "DPP", "DPČ", "externí"];

export function JobFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/kariera?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-[#cfe1f3] bg-white p-4">
      <FilterSelect
        label="Specializace"
        value={params.get("specialization") ?? ""}
        options={SPECIALIZATIONS}
        onChange={(v) => update("specialization", v)}
      />
      <FilterSelect
        label="Region"
        value={params.get("region") ?? ""}
        options={REGIONS}
        onChange={(v) => update("region", v)}
      />
      <FilterSelect
        label="Úvazek"
        value={params.get("employment_type") ?? ""}
        options={TYPES}
        onChange={(v) => update("employment_type", v)}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
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
        <option value="">Vše</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
