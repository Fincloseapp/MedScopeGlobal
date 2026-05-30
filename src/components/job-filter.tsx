"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { JobType } from "@/lib/types";
import { jobSpecializations } from "@/lib/jobs";

export function JobFilter() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/jobs?${next.toString()}`);
  }

  return (
    <form
      className="filter-bar"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        update("q", String(data.get("q") ?? ""));
      }}
    >
      <input name="q" placeholder="Hledat pozici, zaměstnavatele…" defaultValue={params.get("q") ?? ""} aria-label="Hledat pozice" />
      <select defaultValue={params.get("specialization") ?? ""} onChange={(e) => update("specialization", e.target.value)} aria-label="Specializace">
        <option value="">Všechny obory</option>
        {jobSpecializations().map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select defaultValue={params.get("region") ?? ""} onChange={(e) => update("region", e.target.value)} aria-label="Region">
        <option value="">Všechny regiony</option>
        <option value="cz">Česko</option>
        <option value="eu">Evropa</option>
      </select>
      <select defaultValue={params.get("jobType") ?? ""} onChange={(e) => update("jobType", e.target.value)} aria-label="Typ úvazku">
        <option value="">Všechny typy</option>
        {(["full-time", "part-time", "contract", "locum"] as JobType[]).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <button className="button primary" type="submit">
        Filtrovat
      </button>
    </form>
  );
}
