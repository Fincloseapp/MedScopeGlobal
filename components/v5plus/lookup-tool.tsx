"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DoiLookupTool() {
  const [doi, setDoi] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/v5plus/pubmed-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doi }),
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="10.1234/example.doi"
        value={doi}
        onChange={(e) => setDoi(e.target.value)}
      />
      <Button onClick={run} disabled={loading} className="rounded-full bg-[#005B96]">
        {loading ? "Stahuji…" : "Validovat DOI a stáhnout PubMed"}
      </Button>
      {result ? (
        <pre className="text-xs overflow-auto rounded bg-slate-50 p-4">{result}</pre>
      ) : null}
    </div>
  );
}

export function PubMedLookupTool() {
  const [pubmedId, setPubmedId] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/v5plus/pubmed-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubmedId }),
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="PubMed ID (PMID)"
        value={pubmedId}
        onChange={(e) => setPubmedId(e.target.value)}
      />
      <Button onClick={run} disabled={loading} className="rounded-full bg-[#005B96]">
        {loading ? "Stahuji…" : "Stáhnout metadata z NCBI"}
      </Button>
      {result ? (
        <pre className="text-xs overflow-auto rounded bg-slate-50 p-4">{result}</pre>
      ) : null}
    </div>
  );
}

export function RegulatoryLookupTool() {
  const [drug, setDrug] = useState("");
  const [agency, setAgency] = useState<"fda" | "ema" | "sukl">("fda");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/v5plus/regulatory-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugName: drug, agency }),
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <div className="flex gap-2 flex-wrap">
        <input
          className="flex-1 min-w-[200px] rounded-md border px-3 py-2 text-sm"
          placeholder="Název léku"
          value={drug}
          onChange={(e) => setDrug(e.target.value)}
        />
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={agency}
          onChange={(e) => setAgency(e.target.value as "fda" | "ema" | "sukl")}
        >
          <option value="fda">FDA</option>
          <option value="ema">EMA</option>
          <option value="sukl">SÚKL</option>
        </select>
      </div>
      <Button onClick={run} disabled={loading} className="rounded-full bg-[#005B96]">
        {loading ? "Stahuji…" : "Regulatory fetch"}
      </Button>
      {result ? (
        <pre className="text-xs overflow-auto rounded bg-slate-50 p-4">{result}</pre>
      ) : null}
    </div>
  );
}
