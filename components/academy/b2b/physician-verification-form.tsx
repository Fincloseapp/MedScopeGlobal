"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  specializations: Array<{ value: string; label: string }>;
  initial?: {
    first_name?: string;
    last_name?: string;
    clk_id?: string;
    specialization?: string;
  };
};

export function PhysicianVerificationForm({ specializations, initial }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initial?.first_name ?? "");
  const [lastName, setLastName] = useState(initial?.last_name ?? "");
  const [clkId, setClkId] = useState(initial?.clk_id ?? "");
  const [specialization, setSpecialization] = useState(
    initial?.specialization || specializations[0]?.value || "revmatologie"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/academy/b2b/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          clk_id: clkId,
          specialization,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        verified?: boolean;
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Ověření selhalo");
        return;
      }
      if (data.verified) {
        router.push("/academy/lekari");
        router.refresh();
        return;
      }
      setInfo(
        data.message ??
          "Údaje uloženy. Účet čeká na manuální ověření ČLK (obvykle do 1–2 pracovních dnů)."
      );
    } catch {
      setError("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-slate-200 bg-white px-5 py-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-500">Jméno</span>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full border border-slate-200 px-3 py-2 text-[#021d33]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-500">Příjmení</span>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full border border-slate-200 px-3 py-2 text-[#021d33]"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-slate-500">ČLK číslo (clk_id)</span>
        <input
          required
          value={clkId}
          onChange={(e) => setClkId(e.target.value)}
          placeholder="např. 123456"
          className="mt-1 w-full border border-slate-200 px-3 py-2 text-[#021d33]"
        />
      </label>

      <label className="block text-sm">
        <span className="text-slate-500">Specializace</span>
        <select
          required
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="mt-1 w-full border border-slate-200 px-3 py-2 text-[#021d33]"
        >
          <option value="" disabled>
            Vyberte…
          </option>
          {specializations.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#005B96] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Odesílám…" : "Odeslat k ověření"}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {info ? <p className="text-sm text-[#005B96]">{info}</p> : null}
    </form>
  );
}
