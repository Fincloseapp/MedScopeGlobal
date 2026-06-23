import { createServiceRoleClient } from "@/lib/supabase/service";
import { validateMedicalSource } from "@/lib/v5plus/source-validation";

export type RegulatoryAgency = "fda" | "ema" | "sukl";

export type RegulatoryDrugInfo = {
  agency: RegulatoryAgency;
  drugName: string;
  activeSubstance: string | null;
  indications: string | null;
  contraindications: string | null;
  spcUrl: string | null;
  rmpUrl: string | null;
  summary: string;
  url: string;
};

async function fetchFdaLabel(drugName: string): Promise<RegulatoryDrugInfo | null> {
  const q = encodeURIComponent(drugName);
  const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${q}+OR+openfda.generic_name:${q}&limit=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(25_000) });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    results?: {
      openfda?: { brand_name?: string[]; generic_name?: string[] };
      indications_and_usage?: string[];
      contraindications?: string[];
      effective_time?: string;
      id?: string;
    }[];
  };

  const row = json.results?.[0];
  if (!row) return null;

  const brand = row.openfda?.brand_name?.[0] ?? drugName;
  const generic = row.openfda?.generic_name?.[0] ?? null;

  return {
    agency: "fda",
    drugName: brand,
    activeSubstance: generic,
    indications: row.indications_and_usage?.[0]?.slice(0, 2000) ?? null,
    contraindications: row.contraindications?.[0]?.slice(0, 2000) ?? null,
    spcUrl: row.id ? `https://api.fda.gov/drug/label/${row.id}.json` : null,
    rmpUrl: null,
    summary: `FDA label — ${brand}${generic ? ` (${generic})` : ""}`,
    url: "https://www.fda.gov/drugs",
  };
}

async function fetchEmaStub(drugName: string): Promise<RegulatoryDrugInfo | null> {
  const url = `https://www.ema.europa.eu/en/search?search_api_fulltext=${encodeURIComponent(drugName)}`;
  return {
    agency: "ema",
    drugName,
    activeSubstance: null,
    indications: null,
    contraindications: null,
    spcUrl: url,
    rmpUrl: null,
    summary: `EMA vyhledávání — ${drugName}. Ověřte SPC/RMP na ema.europa.eu.`,
    url,
  };
}

async function fetchSuklStub(drugName: string): Promise<RegulatoryDrugInfo | null> {
  const url = `https://www.sukl.cz/hledani/?q=${encodeURIComponent(drugName)}`;
  return {
    agency: "sukl",
    drugName,
    activeSubstance: null,
    indications: null,
    contraindications: null,
    spcUrl: url,
    rmpUrl: null,
    summary: `SÚKL vyhledávání — ${drugName}. Ověřte SPC v databázi SÚKL.`,
    url,
  };
}

export async function fetchRegulatoryDrug(
  drugName: string,
  agency: RegulatoryAgency
): Promise<RegulatoryDrugInfo | null> {
  const name = drugName.trim();
  if (!name) return null;

  switch (agency) {
    case "fda":
      return fetchFdaLabel(name);
    case "ema":
      return fetchEmaStub(name);
    case "sukl":
      return fetchSuklStub(name);
    default:
      return null;
  }
}

export async function upsertMedicalSourceFromRegulatory(
  drugName: string,
  agency: RegulatoryAgency
): Promise<{ id: string; info: RegulatoryDrugInfo } | null> {
  const info = await fetchRegulatoryDrug(drugName, agency);
  if (!info) return null;

  const validation = validateMedicalSource({
    url: info.url,
    title: `${info.drugName} — ${agency.toUpperCase()}`,
    abstract: info.summary,
    sourceType: agency,
  });

  const admin = createServiceRoleClient();
  const row = {
    url: info.url,
    doi: null,
    pubmed_id: null,
    source_type: agency,
    title: `${info.drugName} (${agency.toUpperCase()})`,
    authors: agency.toUpperCase(),
    journal: agency === "fda" ? "FDA openFDA" : agency === "ema" ? "EMA" : "SÚKL",
    year: new Date().getFullYear(),
    abstract: [
      info.summary,
      info.activeSubstance ? `Účinná látka: ${info.activeSubstance}` : "",
      info.indications ? `Indikace: ${info.indications.slice(0, 500)}` : "",
      info.contraindications
        ? `Kontraindikace: ${info.contraindications.slice(0, 500)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    metadata: {
      active_substance: info.activeSubstance,
      indications: info.indications,
      contraindications: info.contraindications,
      spc_url: info.spcUrl,
      rmp_url: info.rmpUrl,
    },
    validated: validation.valid,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await admin
    .from("medical_sources")
    .select("id")
    .eq("source_type", agency)
    .ilike("title", `%${info.drugName}%`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    await admin.from("medical_sources").update(row).eq("id", existing.id);
    return { id: existing.id, info };
  }

  const { data: inserted, error } = await admin
    .from("medical_sources")
    .insert(row)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: inserted.id, info };
}

export async function runDailyRegulatoryUpdate(): Promise<{
  processed: number;
  errors: string[];
}> {
  const drugs = [
    { name: "methotrexate", agency: "fda" as const },
    { name: "adalimumab", agency: "ema" as const },
    { name: "tofacitinib", agency: "sukl" as const },
  ];
  const errors: string[] = [];
  let processed = 0;

  for (const d of drugs) {
    try {
      await upsertMedicalSourceFromRegulatory(d.name, d.agency);
      processed++;
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      errors.push(`${d.name}: ${(e as Error).message}`);
    }
  }

  return { processed, errors };
}
