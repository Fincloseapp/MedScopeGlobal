"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AI_MEDICAL_ASSISTANTS,
  ASSISTANT_ROUTES,
  type AiMedicalAssistant,
  type AiMedicalLanguage,
  type AiMedicalOutputType,
} from "@/lib/ai-medical/types";
import { V4D_SPECIALTIES } from "@/lib/v4d/constants";
import { getAiAssistantCopy } from "@/lib/i18n/ai-assistant-copy";
import { getAiMedicalHubCopy } from "@/lib/i18n/ai-medical-hub-copy";
import { isCzechSurface } from "@/lib/i18n/surface-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

type Props = {
  defaultAssistant?: AiMedicalAssistant;
  title?: string;
  /** Zjednodušené rozhraní pro veřejnost — bez klinických filtrů a přepínačů oborů */
  publicMode?: boolean;
  locale?: string;
};

export function IntelligenceConsole({
  defaultAssistant = "doctor",
  title,
  publicMode = false,
  locale = "cs",
}: Props) {
  const copy = getAiAssistantCopy(locale);
  const medical = getAiMedicalHubCopy(locale);
  const [assistant, setAssistant] = useState<AiMedicalAssistant>(
    publicMode ? "patient" : defaultAssistant,
  );
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<AiMedicalLanguage>(isCzechSurface(locale) ? "cs" : "en");
  const [outputType, setOutputType] = useState<AiMedicalOutputType>(publicMode ? "patient" : "professional");
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
      if (!res.ok) throw new Error(json.error ?? medical.errorAi);
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : medical.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {title ? (
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{title}</h2>
      ) : null}

      {publicMode ? (
        <p className="text-sm text-muted-foreground">{copy.publicHint}</p>
      ) : (
        <div className="flex flex-wrap gap-2 text-xs">
          {AI_MEDICAL_ASSISTANTS.map((a) => (
            <Link
              key={a}
              href={localizePublicHref(ASSISTANT_ROUTES[a], locale)}
              className={`rounded-full px-3 py-1 border ${
                a === assistant
                  ? "bg-[#005B96] text-white border-[#005B96]"
                  : "border-[#8dc4ea] text-[#005B96]"
              }`}
            >
              {medical.assistants[a]}
            </Link>
          ))}
        </div>
      )}

      <div className={`grid gap-4 ${publicMode ? "sm:grid-cols-1 max-w-xs" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {!publicMode ? (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">{copy.assistantLabel}</span>
            <select
              className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
              value={assistant}
              onChange={(e) => setAssistant(e.target.value as AiMedicalAssistant)}
            >
              {AI_MEDICAL_ASSISTANTS.map((a) => (
                <option key={a} value={a}>
                  {medical.assistants[a]}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="font-medium text-slate-700">{copy.languageLabel}</span>
          <select
            className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value as AiMedicalLanguage)}
          >
            <option value="cs">{copy.langCs}</option>
            <option value="sk">{copy.langSk}</option>
            <option value="en">{copy.langEn}</option>
          </select>
        </label>

        {!publicMode ? (
          <>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">{copy.specialtyLabel}</span>
              <select
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                {V4D_SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {medical.specialties[s]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">{copy.outputLabel}</span>
              <select
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                value={outputType}
                onChange={(e) => setOutputType(e.target.value as AiMedicalOutputType)}
              >
                <option value="professional">{copy.outputProfessional}</option>
                <option value="patient">{copy.outputPatient}</option>
              </select>
            </label>
          </>
        ) : null}
      </div>

      {!publicMode ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder={copy.phDiagnosis}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder={copy.phStudy}
            value={studyType}
            onChange={(e) => setStudyType(e.target.value)}
          />
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder={copy.phDrug}
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
          />
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder={copy.phLaw}
            value={legislationCategory}
            onChange={(e) => setLegislationCategory(e.target.value)}
          />
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">{copy.queryLabel}</span>
        <textarea
          className="mt-2 min-h-[140px] w-full rounded-xl border border-[#cfe1f3] px-4 py-3 text-sm"
          placeholder={publicMode ? copy.publicPlaceholder : copy.clinicalPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <Button
        onClick={run}
        disabled={loading}
        className="rounded-full bg-[#005B96] px-8"
      >
        {loading ? copy.loading : publicMode ? copy.ask : copy.run}
      </Button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-6">
          <section>
            <h3 className="font-semibold text-[#005B96]">{copy.answer}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{result.reply}</p>
          </section>
          {result.summary ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">{copy.summary}</h3>
              <p className="mt-2 text-sm text-slate-700">{result.summary}</p>
            </section>
          ) : null}
          {result.recommendations?.length > 0 ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">{copy.recommendations}</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                {result.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {result.clinicalConclusions?.length > 0 ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">{copy.conclusions}</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                {result.clinicalConclusions.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {result.graphicSummary ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">{copy.graphic}</h3>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs text-slate-800">
                {result.graphicSummary}
              </pre>
            </section>
          ) : null}
          {result.sources?.length > 0 ? (
            <section>
              <h3 className="font-semibold text-[#005B96]">{copy.sources}</h3>
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
