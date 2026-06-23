import { normalizeDoi } from "@/lib/ai/doi";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { validateMedicalSource } from "@/lib/v5plus/source-validation";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function ncbiParams(url: URL) {
  url.searchParams.set("tool", process.env.NCBI_TOOL ?? "medscopeglobal");
  url.searchParams.set(
    "email",
    process.env.NCBI_CONTACT_EMAIL ?? "info@medscopeglobal.com"
  );
  const apiKey = process.env.NCBI_API_KEY?.trim();
  if (apiKey) url.searchParams.set("api_key", apiKey);
}

async function ncbiGet(url: URL): Promise<unknown> {
  ncbiParams(url);
  const res = await fetch(url, {
    headers: { "User-Agent": "MedScopeGlobal/1.0" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`NCBI ${res.status}`);
  return res.json();
}

export type PubMedMetadata = {
  pubmedId: string;
  doi: string | null;
  title: string;
  authors: string;
  journal: string;
  year: number | null;
  abstract: string;
  url: string;
  pmcId: string | null;
};

export async function resolvePubMedId(input: {
  doi?: string;
  pubmedId?: string;
}): Promise<string | null> {
  if (input.pubmedId?.trim()) return input.pubmedId.replace(/\D/g, "");
  const doi = input.doi ? normalizeDoi(input.doi) : null;
  if (!doi) return null;

  const url = new URL(`${EUTILS}/esearch.fcgi`);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("term", `${doi}[doi]`);
  url.searchParams.set("retmax", "1");
  url.searchParams.set("retmode", "json");

  const json = (await ncbiGet(url)) as { esearchresult?: { idlist?: string[] } };
  return json.esearchresult?.idlist?.[0] ?? null;
}

export async function fetchPubMedMetadata(input: {
  doi?: string;
  pubmedId?: string;
}): Promise<PubMedMetadata | null> {
  const pmid = await resolvePubMedId(input);
  if (!pmid) return null;

  const sumUrl = new URL(`${EUTILS}/esummary.fcgi`);
  sumUrl.searchParams.set("db", "pubmed");
  sumUrl.searchParams.set("id", pmid);
  sumUrl.searchParams.set("retmode", "json");

  const summary = (await ncbiGet(sumUrl)) as {
    result?: Record<
      string,
      {
        title?: string;
        source?: string;
        pubdate?: string;
        authors?: { name: string }[];
        articleids?: { idtype: string; value: string }[];
      }
    >;
  };

  const row = summary.result?.[pmid];
  if (!row?.title) return null;

  let doi: string | null = null;
  let pmcId: string | null = null;
  for (const aid of row.articleids ?? []) {
    if (aid.idtype === "doi") doi = normalizeDoi(aid.value);
    if (aid.idtype === "pmc") pmcId = aid.value;
  }
  if (!doi && input.doi) doi = normalizeDoi(input.doi);

  const yearMatch = row.pubdate?.match(/\d{4}/);
  const authors = row.authors?.map((a) => a.name).join(", ") ?? "";

  const fetchUrl = new URL(`${EUTILS}/efetch.fcgi`);
  fetchUrl.searchParams.set("db", "pubmed");
  fetchUrl.searchParams.set("id", pmid);
  fetchUrl.searchParams.set("retmode", "text");
  fetchUrl.searchParams.set("rettype", "abstract");

  let abstract = "";
  try {
    ncbiParams(fetchUrl);
    const absRes = await fetch(fetchUrl, { signal: AbortSignal.timeout(30_000) });
    if (absRes.ok) abstract = (await absRes.text()).slice(0, 8000);
  } catch {
    abstract = "";
  }

  return {
    pubmedId: pmid,
    doi,
    title: row.title.replace(/\.$/, ""),
    authors,
    journal: row.source ?? "PubMed",
    year: yearMatch ? parseInt(yearMatch[0], 10) : null,
    abstract,
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    pmcId,
  };
}

export async function upsertMedicalSourceFromPubMed(input: {
  doi?: string;
  pubmedId?: string;
}): Promise<{ id: string; metadata: PubMedMetadata } | null> {
  const meta = await fetchPubMedMetadata(input);
  if (!meta) return null;

  const validation = validateMedicalSource({
    url: meta.url,
    doi: meta.doi,
    title: meta.title,
    abstract: meta.abstract,
    sourceType: meta.pmcId ? "pmc" : "pubmed",
  });

  const admin = createServiceRoleClient();
  const sourceType = meta.pmcId ? "pmc" : "pubmed";
  const row = {
    url: meta.pmcId
      ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${meta.pmcId}/`
      : meta.url,
    doi: validation.normalizedDoi ?? meta.doi,
    pubmed_id: meta.pubmedId,
    source_type: sourceType,
    title: meta.title,
    authors: meta.authors,
    journal: meta.journal,
    year: meta.year,
    abstract: meta.abstract,
    metadata: { pmc_id: meta.pmcId, validation: validation.reasons },
    validated: validation.valid,
    updated_at: new Date().toISOString(),
  };

  if (row.doi) {
    const { data: existing } = await admin
      .from("medical_sources")
      .select("id")
      .ilike("doi", row.doi)
      .maybeSingle();
    if (existing) {
      await admin.from("medical_sources").update(row).eq("id", existing.id);
      return { id: existing.id, metadata: meta };
    }
  }

  if (row.pubmed_id) {
    const { data: existing } = await admin
      .from("medical_sources")
      .select("id")
      .eq("pubmed_id", row.pubmed_id)
      .maybeSingle();
    if (existing) {
      await admin.from("medical_sources").update(row).eq("id", existing.id);
      return { id: existing.id, metadata: meta };
    }
  }

  const { data: inserted, error } = await admin
    .from("medical_sources")
    .insert(row)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: inserted.id, metadata: meta };
}
