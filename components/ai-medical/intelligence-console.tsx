"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AI_MEDICAL_ASSISTANTS,
  ASSISTANT_LABELS_CS,
  ASSISTANT_ROUTES,
  type AiMedicalAssistant,
  type AiMedicalLanguage,
  type AiMedicalOutputType,
} from "@/lib/ai-medical/types";
import { V4D_SPECIALTIES, SPECIALTY_LABELS_CS } from "@/lib/v4d/constants";

type Props = {
  defaultAssistant?: AiMedicalAssistant;
  title?: string;
  /** Hide assistant/specialty switchers — single-product UX for /ai-asistent/* */
  simplified?: boolean;
};

export function IntelligenceConsole({
  defaultAssistant = "doctor",
  title,
  simplified = false,
}: Props) {
  const [assistant, setAssistant] = useState<AiMedicalAssistant>(defaultAssistant);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<AiMedicalLanguage>("cs");
  const [outputType, setOutputType] = useState<AiMedicalOutputType>("professional");
  const [specialty, setSpecialty] = useState("rheumatology");
  const [diagnosis, setDiagnosis] = useState("");
  const [studyType, setStudyType] = useState("");
  const [drugName, setDrugName] = useState("");
  const [legislationCategory, setLegislationCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    reply: string;
    summary: string;
    recommendations: string[];
    clinicalConclusions: string[];
    graphicSummary: string;
    sources: { title: string; source: string; snippet: string }[];
  } | null>(null);

  async function run() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai-medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistant,
          query,
          language,
          outputType,
          specialty,
          diagnosis: diagnosis || undefined,
          studyType: studyType || undefined,
          drugName: drugName || undefined,
          legislationCategory: legislationCategory || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Chyba AI");
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {title ? (
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{title}</h2>
      ) : null}

      {!simplified ? (
        <div className="flex flex-wrap gap-2 text-xs">
          {AI_MEDICAL_ASSISTANTS.map((a) => (
            <Link
              key={a}
              href={ASSISTANT_ROUTES[a]}
              className={`rounded-full px-3 py-1 border ${
                a === assistant
                  ? "bg-[#005B96] text-white border-[#005B96]"
                  : "border-[#8dc4ea] text-[#005B96]"
              }`}
            >
              {ASSISTANT_LABELS_CS[a]}
            </Link>
          ))}
        </div>
      ) : null}

      <div className={`grid gap-4 ${simplified ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {!simplified ? (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Asistent</span>
            <select
              className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
              value={assistant}
              onChange={(e) => setAssistant(e.target.value as AiMedicalAssistant)}
            >
              {AI_MEDICAL_ASSISTANTS.map((a) => (
                <option key={a} value={a}>
                  {ASSISTANT_LABELS_CS[a]}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="font-medium text-slate-700">Jazyk</span>
          <select
            className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value as AiMedicalLanguage)}
          >
            <option value="cs">Čeština</option>
            <option value="sk">Slovenština</option>
            <option value="en">Angličtina</option>
          </select>
        </label>

        {!simplified ? (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Obor</span>
            <select
              className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              {V4D_SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {SPECIALTY_LABELS_CS[s]}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="font-medium text-slate-700">Typ výstupu</span>
          <select
            className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
            value={outputType}
            onChange={(e) => setOutputType(e.target.value as AiMedicalOutputType)}
          >
            <option value="professional">Odborný</option>
            <option value="patient">Pacientský</option>
          </select>
        </label>
      </div>

      {!simplified ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder="Diagnóza (ra, psa, as…)"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder="Typ studie (rct, meta-analysis…)"
            value={studyType}
            onChange={(e) => setStudyType(e.target.value)}
          />
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder="Název léku"
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
          />
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder="Kategorie legislativy"
            value={legislationCategory}
            onChange={(e) => setLegislationCategory(e.target.value)}
          />
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Dotaz</span>
        <textarea
          className="mt-2 min-h-[140px] w-full rounded-xl border border-[#cfe1f3] px-4 py-3 text-sm"
          placeholder="Zadejte klinický dotaz, požadavek na shrnutí, přehled studií…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <Button
        onClick={run}
        disabled={loading}
        className="rounded-full bg-[#005B96] px-8"
      >
        {loading ? "AI Medical Intelligence…" : "Spustit asistenta"}
      </Button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-6">
          <section>
            <h3 className="font-semibold text-[#005B96]">Odpověď</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{result.reply}</p>
          </section>
          {result.summary ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">Shrnutí</h3>
              <p className="mt-2 text-sm text-slate-700">{result.summary}</p>
            </section>
          ) : null}
          {result.recommendations?.length > 0 ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">Doporučení</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                {result.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {result.clinicalConclusions?.length > 0 ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">Klinické závěry</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                {result.clinicalConclusions.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {result.graphicSummary ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">Grafické shrnutí (text)</h3>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs text-slate-800">
                {result.graphicSummary}
              </pre>
            </section>
          ) : null}
          {result.sources?.length > 0 ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">Zdroje z databáze</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {result.sources.map((s, i) => (
                  <li key={i} className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-500">{s.source}</span>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-slate-600 line-clamp-2">{s.snippet}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
